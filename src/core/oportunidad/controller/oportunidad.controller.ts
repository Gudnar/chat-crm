import {
  Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Request, UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { OportunidadService } from '../service/oportunidad.service'
import {
  AsignarOportunidadDto,
  CambiarEstadoOportunidadDto,
  CreateOportunidadDto,
  EditarHistorialDto,
  RegistrarSeguimientoDto,
  UpdateOportunidadDto,
} from '../dto/oportunidad.dto'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'
import { Roles } from '../../../common/constants'

@ApiTags('Oportunidades')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard)
@Controller('oportunidades')
export class OportunidadController {
  constructor(private readonly oportunidadService: OportunidadService) {}

  // Los agentes humanos solo ven sus oportunidades asignadas
  private forzarAsignado(req: any, asignadoA?: string): string | undefined {
    return req.user?.rol === Roles.AGENTE_HUMANO ? req.user.id : asignadoA
  }

  @Get()
  async listar(
    @Query('q') q: string,
    @Query('estado') estadoOportunidad: string,
    @Query('prioridad') prioridad: string,
    @Query('asignadoA') asignadoA: string,
    @Query('pagina') pagina: string,
    @Query('limite') limite: string,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const paginaNum = Math.max(1, parseInt(pagina, 10) || 1)
    const limiteNum = Math.min(100, Math.max(1, parseInt(limite, 10) || 25))
    const datos = await this.oportunidadService.listar(
      req.user.clienteId,
      { q, estadoOportunidad, prioridad, asignadoA: this.forzarAsignado(req, asignadoA) },
      paginaNum,
      limiteNum,
    )
    return new SuccessResponseDto(datos)
  }

  @Get('estadisticas')
  async estadisticas(@Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.oportunidadService.estadisticas(
      req.user.clienteId,
      this.forzarAsignado(req),
    )
    return new SuccessResponseDto(datos)
  }

  @Get('usuarios-asignables')
  async usuariosAsignables(@Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.oportunidadService.usuariosAsignables(req.user.clienteId)
    return new SuccessResponseDto(datos)
  }

  @Get(':id')
  async obtener(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.oportunidadService.obtener(id, req.user.clienteId)
    return new SuccessResponseDto(datos)
  }

  @Post()
  async crear(@Body() dto: CreateOportunidadDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.oportunidadService.crear(dto, req.user.clienteId, req.user.id)
    return new SuccessResponseDto(datos, `Oportunidad ${datos.numeroOportunidad} creada`)
  }

  @Put(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateOportunidadDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.oportunidadService.actualizar(id, dto, req.user.clienteId, req.user.id)
    return new SuccessResponseDto(datos, 'Oportunidad actualizada')
  }

  @Patch(':id/estado')
  async cambiarEstado(
    @Param('id') id: string,
    @Body() dto: CambiarEstadoOportunidadDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.oportunidadService.cambiarEstado(
      id, dto.estado, dto.motivo, req.user.clienteId, req.user.id,
    )
    return new SuccessResponseDto(datos, 'Estado actualizado')
  }

  @Patch(':id/asignar')
  async asignar(
    @Param('id') id: string,
    @Body() dto: AsignarOportunidadDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.oportunidadService.asignar(id, dto.usuarioId, req.user.clienteId, req.user.id)
    return new SuccessResponseDto(datos, 'Oportunidad asignada')
  }

  @Post(':id/seguimiento')
  async registrarSeguimiento(
    @Param('id') id: string,
    @Body() dto: RegistrarSeguimientoDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.oportunidadService.registrarSeguimiento(id, dto, req.user.clienteId, req.user.id)
    return new SuccessResponseDto(datos, 'Seguimiento registrado')
  }

  @Patch(':id/historial')
  async editarHistorial(
    @Param('id') id: string,
    @Body() dto: EditarHistorialDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.oportunidadService.editarHistorial(id, dto.indice, dto.detalles, req.user.clienteId, req.user.id)
    return new SuccessResponseDto(datos, 'Entrada del historial corregida')
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    await this.oportunidadService.eliminar(id, req.user.clienteId, req.user.id)
    return new SuccessResponseDto(null, 'Oportunidad eliminada')
  }
}
