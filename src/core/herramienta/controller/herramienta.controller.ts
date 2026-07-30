import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { HerramientaService } from '../service/herramienta.service'
import { AgenteService } from '../../agente/service/agente.service'
import { CreateHerramientaDto, UpdateHerramientaDto } from '../dto/create-herramienta.dto'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'
import { Messages } from '../../../common/constants/response-messages'

@ApiTags('Herramientas')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard)
@Controller('herramientas')
export class HerramientaController {
  constructor(
    private readonly herramientaService: HerramientaService,
    private readonly agenteService: AgenteService,
  ) {}

  @Get('agente/:agenteId')
  async listar(@Param('agenteId') agenteId: string, @Request() req: any): Promise<SuccessResponseDto> {
    // Verifica que el agente pertenezca al cliente del usuario
    await this.agenteService.obtener(agenteId, this.clienteIdDe(req))
    const datos = await this.herramientaService.listarPorAgente(agenteId)
    return new SuccessResponseDto(datos)
  }

  @Post()
  async crear(@Body() dto: CreateHerramientaDto, @Request() req: any): Promise<SuccessResponseDto> {
    await this.agenteService.obtener(dto.agenteId, this.clienteIdDe(req))
    const datos = await this.herramientaService.crear(dto, req.user.id)
    return new SuccessResponseDto(datos, Messages.SUCCESS_CREATE)
  }

  /** Crea las 5 herramientas estándar (buscar_producto, calificar_lead, etc.) para un agente que no las tenga. */
  @Post('defaults/:agenteId')
  async crearDefaults(@Param('agenteId') agenteId: string, @Request() req: any): Promise<SuccessResponseDto> {
    await this.agenteService.obtener(agenteId, this.clienteIdDe(req))
    const existentes = await this.herramientaService.listarPorAgente(agenteId)
    if (existentes.length > 0) {
      return new SuccessResponseDto(existentes, 'El agente ya tiene herramientas configuradas')
    }
    await this.herramientaService.crearHerramientasPorDefecto(agenteId, req.user.id)
    const datos = await this.herramientaService.listarPorAgente(agenteId)
    return new SuccessResponseDto(datos, `${datos.length} herramientas creadas para el agente`)
  }

  @Put(':id')
  async actualizar(@Param('id') id: string, @Body() dto: UpdateHerramientaDto, @Request() req: any): Promise<SuccessResponseDto> {
    const h = await this.herramientaService.obtener(id)
    await this.agenteService.obtener(h.agenteId, this.clienteIdDe(req))
    const datos = await this.herramientaService.actualizar(id, dto, req.user.id)
    return new SuccessResponseDto(datos, Messages.SUCCESS_UPDATE)
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const h = await this.herramientaService.obtener(id)
    await this.agenteService.obtener(h.agenteId, this.clienteIdDe(req))
    await this.herramientaService.eliminar(id, req.user.id)
    return new SuccessResponseDto(null, Messages.SUCCESS_DELETE)
  }

  /**
   * SUPER_ADMIN (usuario.cliente_id NULL) administra herramientas de un cliente concreto
   * seleccionado en el frontend. Mismo gotcha ya resuelto en AgenteController/WhatsappController.
   */
  private clienteIdDe(req: any): string {
    const deSesion = req.user?.clienteId
    if (deSesion) return String(deSesion)
    const deQuery = req.query?.clienteId
    if (deQuery) return String(deQuery)
    throw new BadRequestException('Debes indicar el cliente a administrar (parámetro clienteId)')
  }
}
