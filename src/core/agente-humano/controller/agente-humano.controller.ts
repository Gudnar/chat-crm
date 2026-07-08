import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AgenteHumanoService } from '../service/agente-humano.service'
import { AsignacionService } from '../service/asignacion.service'
import {
  CreateAgenteHumanoDto,
  UpdateAgenteHumanoDto,
  CambiarDisponibilidadDto,
  AsignarConversacionDto,
  CerrarConversacionDto,
} from '../dto/agente-humano.dto'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { Roles as Rol } from '../../../common/constants'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'

@ApiTags('Agentes Humanos')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('agentes-humanos')
export class AgenteHumanoController {
  constructor(
    private readonly agenteHumanoService: AgenteHumanoService,
    private readonly asignacionService: AsignacionService,
  ) {}

  // ── Gestión (Admin) ───────────────────────────────────────────────────────

  @Get()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN_CLIENTE)
  async listar(@Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.agenteHumanoService.listar(this.clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  @Post()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN_CLIENTE)
  async crear(@Body() dto: CreateAgenteHumanoDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.agenteHumanoService.crear(dto, req.user.id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos, 'Agente humano creado. Ya puede iniciar sesión con sus credenciales.')
  }

  @Get('disponibles')
  async disponibles(@Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.agenteHumanoService.obtenerDisponibles(this.clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  @Get('equipo/estadisticas')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN_CLIENTE)
  async estadisticasEquipo(@Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.agenteHumanoService.estadisticasEquipo(this.clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  // ── Asignación de conversaciones ──────────────────────────────────────────

  @Get('cola')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN_CLIENTE, Rol.AGENTE_HUMANO)
  async cola(@Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.asignacionService.colaSinAsignar(this.clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  @Post('asignar')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN_CLIENTE, Rol.AGENTE_HUMANO)
  async asignar(@Body() dto: AsignarConversacionDto, @Request() req: any): Promise<SuccessResponseDto> {
    // Un agente humano solo puede tomar conversaciones para sí mismo
    if (this.esAgenteHumano(req)) {
      const propio = await this.agentePropio(req)
      dto.agenteHumanoId = propio.id
    }
    const datos = await this.asignacionService.asignar(dto, req.user.id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos, 'Conversación asignada correctamente.')
  }

  @Post('asignacion-automatica')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN_CLIENTE)
  async asignacionAutomatica(@Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.asignacionService.asignacionAutomatica(req.user.id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos, `${datos.asignadas} conversación(es) asignada(s).`)
  }

  @Post('conversaciones/:id/cerrar')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN_CLIENTE, Rol.AGENTE_HUMANO)
  async cerrarConversacion(
    @Param('id') id: string,
    @Body() dto: CerrarConversacionDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const actor = await this.resolverActor(req)
    const datos = await this.asignacionService.cerrar(id, dto, actor, this.clienteIdDe(req))
    return new SuccessResponseDto(datos, 'Conversación marcada como resuelta.')
  }

  @Post('conversaciones/:id/devolver-ia')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN_CLIENTE, Rol.AGENTE_HUMANO)
  async devolverAIa(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const actor = await this.resolverActor(req)
    const datos = await this.asignacionService.devolverAIa(id, actor, this.clienteIdDe(req))
    return new SuccessResponseDto(datos, 'Conversación devuelta al agente IA.')
  }

  // ── Panel personal del agente humano ──────────────────────────────────────

  @Get('mi-perfil')
  @Roles(Rol.AGENTE_HUMANO)
  async miPerfil(@Request() req: any): Promise<SuccessResponseDto> {
    const propio = await this.agentePropio(req)
    const datos = await this.agenteHumanoService.estadisticas(propio.id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  @Patch('mi-disponibilidad')
  @Roles(Rol.AGENTE_HUMANO)
  async miDisponibilidad(@Body() dto: CambiarDisponibilidadDto, @Request() req: any): Promise<SuccessResponseDto> {
    const propio = await this.agentePropio(req)
    const datos = await this.agenteHumanoService.cambiarDisponibilidad(propio.id, dto.estado, this.clienteIdDe(req))
    return new SuccessResponseDto(datos, `Ahora estás ${dto.estado}.`)
  }

  @Get('mis-conversaciones')
  @Roles(Rol.AGENTE_HUMANO)
  async misConversaciones(@Request() req: any): Promise<SuccessResponseDto> {
    const propio = await this.agentePropio(req)
    const datos = await this.asignacionService.misConversaciones(propio.id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  // ── Detalle por id (Admin) — deben ir al final por el orden de rutas ─────

  @Get(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN_CLIENTE)
  async obtener(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.agenteHumanoService.obtener(id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  @Put(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN_CLIENTE)
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateAgenteHumanoDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.agenteHumanoService.actualizar(id, dto, req.user.id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos, 'Agente humano actualizado.')
  }

  @Delete(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN_CLIENTE)
  async eliminar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    await this.agenteHumanoService.eliminar(id, req.user.id, this.clienteIdDe(req))
    return new SuccessResponseDto(null, 'Agente humano eliminado y credenciales desactivadas.')
  }

  @Patch(':id/disponibilidad')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN_CLIENTE)
  async cambiarDisponibilidad(
    @Param('id') id: string,
    @Body() dto: CambiarDisponibilidadDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.agenteHumanoService.cambiarDisponibilidad(id, dto.estado, this.clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  @Get(':id/estadisticas')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN_CLIENTE)
  async estadisticas(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.agenteHumanoService.estadisticas(id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  @Get(':id/actividad')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN_CLIENTE)
  async actividad(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.agenteHumanoService.actividad(id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Multi-tenancy: los agentes humanos SIEMPRE se operan dentro de un cliente.
   * ADMIN_CLIENTE y AGENTE_HUMANO usan el cliente de su sesion; el SUPER_ADMIN
   * (sin cliente propio) debe indicar ?clienteId=<id> del cliente que administra.
   * Sin esto, TypeORM ignora el filtro null y mezclaria agentes de todos los clientes.
   */
  private clienteIdDe(req: any): string {
    const deSesion = req.user?.clienteId
    if (deSesion) return String(deSesion)
    const deQuery = req.query?.clienteId
    if (deQuery) return String(deQuery)
    throw new BadRequestException(
      'Debes indicar el cliente a administrar (parametro clienteId). Selecciona un cliente en el modulo Clientes.',
    )
  }

  private esAgenteHumano(req: any): boolean {
    const roles: string[] = req.user?.roles ?? []
    return roles.includes(Rol.AGENTE_HUMANO)
  }

  private async agentePropio(req: any) {
    const agente = await this.agenteHumanoService.obtenerPorUsuarioId(req.user.id)
    if (!agente) throw new NotFoundException('No tienes un perfil de agente humano asociado.')
    return agente
  }

  private async resolverActor(req: any): Promise<{ agenteHumanoId?: string; usuarioId: string }> {
    if (this.esAgenteHumano(req)) {
      const propio = await this.agentePropio(req)
      return { agenteHumanoId: propio.id, usuarioId: req.user.id }
    }
    return { usuarioId: req.user.id }
  }
}
