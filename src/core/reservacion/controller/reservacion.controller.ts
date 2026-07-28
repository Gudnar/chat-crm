import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { ReservacionService } from '../service/reservacion.service'
import { CreateReservaDto, UpdateReservaDto, ActualizarEstadoReservaDto } from '../dto/reserva.dto'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'
import { EstadoReserva } from '../../../common/constants'
import { AgenteHumanoService } from '../../agente-humano/service/agente-humano.service'

@ApiTags('Reservaciones')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reservaciones')
export class ReservacionController {
  constructor(
    private readonly reservacionService: ReservacionService,
    private readonly agenteHumanoService: AgenteHumanoService,
  ) {}

  @Get('disponibilidad')
  async obtenerDisponibilidad(
    @Query('agenteId') agenteId: string,
    @Query('fecha') fecha: string,
    @Query('duracionMinutos') duracionMinutos: string,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    if (!agenteId || !fecha) throw new BadRequestException('agenteId y fecha son obligatorios')
    const datos = await this.reservacionService.obtenerDisponibilidad(
      agenteId,
      this.clienteIdDe(req),
      fecha,
      Number(duracionMinutos) || 30,
    )
    return new SuccessResponseDto(datos)
  }

  @Get('mias')
  @Roles('AGENTE_HUMANO')
  async listarMias(@Request() req: any): Promise<SuccessResponseDto> {
    const propio = await this.agenteHumanoService.obtenerPorUsuarioId(req.user.id)
    if (!propio) throw new BadRequestException('No tienes un agente humano asociado a tu usuario')
    const datos = await this.reservacionService.listar(this.clienteIdDe(req), { agenteId: propio.id })
    return new SuccessResponseDto(datos)
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE', 'COLABORADOR')
  async listar(
    @Query('agenteId') agenteId: string,
    @Query('estado') estado: string,
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.reservacionService.listar(this.clienteIdDe(req), { agenteId, estado, desde, hasta })
    return new SuccessResponseDto(datos)
  }

  @Get(':id')
  async obtener(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.reservacionService.obtener(id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  @Post()
  async crear(@Body() dto: CreateReservaDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.reservacionService.crear(dto, req.user.id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos, `Reserva ${datos.codigoReserva} creada`)
  }

  @Put(':id')
  async actualizar(@Param('id') id: string, @Body() dto: UpdateReservaDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.reservacionService.actualizar(id, dto, req.user.id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos, 'Reserva actualizada')
  }

  @Put(':id/estado')
  async actualizarEstado(
    @Param('id') id: string,
    @Body() dto: ActualizarEstadoReservaDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.reservacionService.actualizarEstado(id, dto, req.user.id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos, 'Estado de la reserva actualizado')
  }

  @Delete(':id')
  async cancelar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.reservacionService.actualizarEstado(
      id,
      { estado: EstadoReserva.CANCELADA },
      req.user.id,
      this.clienteIdDe(req),
    )
    return new SuccessResponseDto(datos, 'Reserva cancelada')
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
