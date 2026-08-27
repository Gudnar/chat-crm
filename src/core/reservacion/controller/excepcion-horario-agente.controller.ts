import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { ExcepcionHorarioAgenteService } from '../service/excepcion-horario-agente.service'
import { CreateExcepcionHorarioAgenteDto, UpdateExcepcionHorarioAgenteDto } from '../dto/excepcion-horario-agente.dto'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'
import { AgenteHumanoService } from '../../agente-humano/service/agente-humano.service'

@ApiTags('Excepciones de Horario (feriados/ausencias)')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('excepciones-horario-agente')
export class ExcepcionHorarioAgenteController {
  constructor(
    private readonly excepcionService: ExcepcionHorarioAgenteService,
    private readonly agenteHumanoService: AgenteHumanoService,
  ) {}

  @Get()
  async listar(@Query('agenteId') agenteId: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.excepcionService.listar(this.clienteIdDe(req), { agenteId })
    return new SuccessResponseDto(datos)
  }

  @Get('rango')
  async listarEnRango(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
    @Query('agenteId') agenteId: string,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    if (!desde || !hasta) throw new BadRequestException('desde y hasta son obligatorios')
    const datos = await this.excepcionService.listarEnRango(this.clienteIdDe(req), desde, hasta, agenteId)
    return new SuccessResponseDto(datos)
  }

  @Get('mias')
  @Roles('AGENTE_HUMANO')
  async listarMias(@Query('desde') desde: string, @Query('hasta') hasta: string, @Request() req: any): Promise<SuccessResponseDto> {
    const propio = await this.agenteHumanoService.obtenerPorUsuarioId(req.user.id)
    if (!propio) throw new BadRequestException('No tienes un agente humano asociado a tu usuario')

    const clienteId = this.clienteIdDe(req)
    const hoy = new Date()
    const desdeDefault = desde || new Date(hoy.getFullYear(), hoy.getMonth() - 6, 1).toISOString().slice(0, 10)
    const hastaDefault = hasta || new Date(hoy.getFullYear(), hoy.getMonth() + 6, 0).toISOString().slice(0, 10)

    const datos = await this.excepcionService.listarEnRango(clienteId, desdeDefault, hastaDefault, propio.id)
    return new SuccessResponseDto(datos)
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async crear(@Body() dto: CreateExcepcionHorarioAgenteDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.excepcionService.crear(dto, req.user.id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos, 'Excepción de calendario creada')
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateExcepcionHorarioAgenteDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.excepcionService.actualizar(id, dto, req.user.id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos, 'Excepción de calendario actualizada')
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async eliminar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    await this.excepcionService.eliminar(id, req.user.id, this.clienteIdDe(req))
    return new SuccessResponseDto(null, 'Excepción de calendario eliminada')
  }

  /** SUPER_ADMIN (sin cliente propio) debe pasar ?clienteId=; el resto usa el de su sesión. */
  private clienteIdDe(req: any): string {
    const deSesion = req.user?.clienteId
    if (deSesion) return String(deSesion)
    const deQuery = req.query?.clienteId
    if (deQuery) return String(deQuery)
    throw new BadRequestException('Debes indicar el cliente a administrar (parametro clienteId)')
  }
}
