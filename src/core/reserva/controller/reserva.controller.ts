import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'
import { ReservaService } from '../service/reserva.service'
import { CrearReservaDto } from '../dto/crear-reserva.dto'
import { ActualizarReservaDto } from '../dto/actualizar-reserva.dto'
import { FiltroExportacionDto } from '../dto/filtro-exportacion.dto'

const clienteIdDe = (req: any): string => {
  return req.user?.clienteId || req.headers['x-cliente-id'] || null
}

@Controller('reservas')
@UseGuards(JwtAuthGuard)
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Post()
  async crear(@Body() dto: CrearReservaDto, @Req() req: any): Promise<SuccessResponseDto> {
    const clienteId = clienteIdDe(req)
    const usuarioId = req.user?.id || 'sistema'
    const reserva = await this.reservaService.crear(dto, clienteId, usuarioId)
    return new SuccessResponseDto(reserva, 'Reserva creada')
  }

  @Get()
  async listar(@Query() filtros: FiltroExportacionDto, @Req() req: any): Promise<SuccessResponseDto> {
    const clienteId = clienteIdDe(req)
    const reservas = await this.reservaService.listar(clienteId, filtros)
    return new SuccessResponseDto(reservas, 'Reservas obtenidas')
  }

  @Get(':id')
  async obtener(@Param('id') id: string, @Req() req: any): Promise<SuccessResponseDto> {
    const clienteId = clienteIdDe(req)
    const reserva = await this.reservaService.obtener(id, clienteId)
    return new SuccessResponseDto(reserva, 'Reserva obtenida')
  }

  @Put(':id')
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarReservaDto, @Req() req: any): Promise<SuccessResponseDto> {
    const clienteId = clienteIdDe(req)
    const usuarioId = req.user?.id || 'sistema'
    const reserva = await this.reservaService.actualizar(id, dto, clienteId, usuarioId)
    return new SuccessResponseDto(reserva, 'Reserva actualizada')
  }

  @Put(':id/estado')
  async cambiarEstado(
    @Param('id') id: string,
    @Body() body: { estado: string },
    @Req() req: any,
  ): Promise<SuccessResponseDto> {
    const clienteId = clienteIdDe(req)
    const usuarioId = req.user?.id || 'sistema'
    await this.reservaService.cambiarEstado(id, body.estado, clienteId, usuarioId)
    return new SuccessResponseDto({ id, nuevoEstado: body.estado }, 'Estado actualizado')
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string, @Req() req: any): Promise<SuccessResponseDto> {
    const clienteId = clienteIdDe(req)
    const usuarioId = req.user?.id || 'sistema'
    await this.reservaService.eliminar(id, clienteId, usuarioId)
    return new SuccessResponseDto({ id }, 'Reserva eliminada')
  }

  @Get('agente/:agenteId/listar')
  async listarPorAgente(@Param('agenteId') agenteId: string, @Req() req: any): Promise<SuccessResponseDto> {
    const clienteId = clienteIdDe(req)
    const reservas = await this.reservaService.listarPorAgente(agenteId, clienteId)
    return new SuccessResponseDto(reservas, 'Reservas del agente')
  }
}
