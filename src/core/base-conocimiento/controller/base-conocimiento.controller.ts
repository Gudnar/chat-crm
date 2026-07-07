import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { BaseConocimientoService } from '../service/base-conocimiento.service'
import { AgenteService } from '../../agente/service/agente.service'
import { CreateBaseConocimientoDto, UpdateBaseConocimientoDto } from '../dto/create-base-conocimiento.dto'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'

@ApiTags('Base de Conocimiento')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard)
@Controller('agentes/:agenteId/base-conocimiento')
export class BaseConocimientoController {
  constructor(
    private readonly baseConocimientoService: BaseConocimientoService,
    private readonly agenteService: AgenteService,
  ) {}

  @Get()
  async listar(@Param('agenteId') agenteId: string, @Request() req: any): Promise<SuccessResponseDto> {
    await this.agenteService.obtener(agenteId, req.user.clienteId)
    const datos = await this.baseConocimientoService.listarPorAgente(agenteId)
    return new SuccessResponseDto(datos)
  }

  @Post()
  async crear(
    @Param('agenteId') agenteId: string,
    @Body() dto: CreateBaseConocimientoDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    await this.agenteService.obtener(agenteId, req.user.clienteId)
    const datos = await this.baseConocimientoService.crear({ ...dto, agenteId }, req.user.id)
    return new SuccessResponseDto(datos, 'Pregunta frecuente creada correctamente')
  }

  @Put(':id')
  async actualizar(
    @Param('agenteId') agenteId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBaseConocimientoDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    await this.agenteService.obtener(agenteId, req.user.clienteId)
    const datos = await this.baseConocimientoService.actualizar(id, dto, req.user.id)
    return new SuccessResponseDto(datos, 'Pregunta frecuente actualizada correctamente')
  }

  @Delete(':id')
  async eliminar(
    @Param('agenteId') agenteId: string,
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    await this.agenteService.obtener(agenteId, req.user.clienteId)
    await this.baseConocimientoService.eliminar(id, req.user.id)
    return new SuccessResponseDto(null, 'Pregunta frecuente eliminada correctamente')
  }
}
