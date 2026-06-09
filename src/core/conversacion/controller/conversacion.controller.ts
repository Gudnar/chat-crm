import { Body, Controller, Get, Param, Patch, Post, Put, Query, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ConversacionService } from '../service/conversacion.service'
import { CalificacionService } from '../service/calificacion.service'
import { CreateConversacionDto, AgregarMensajeDto } from '../dto/create-conversacion.dto'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'

@ApiTags('Conversaciones')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard)
@Controller('conversaciones')
export class ConversacionController {
  constructor(
    private readonly conversacionService: ConversacionService,
    private readonly calificacionService: CalificacionService,
  ) {}

  @Get()
  async listar(@Query('agenteId') agenteId: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.conversacionService.listar(req.user.clienteId, agenteId)
    return new SuccessResponseDto(datos)
  }

  @Get('estadisticas')
  async estadisticas(@Query('agenteId') agenteId: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.conversacionService.estadisticas(req.user.clienteId, agenteId)
    return new SuccessResponseDto(datos)
  }

  @Get('calificacion-config')
  async obtenerConfigCalificacion(@Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.calificacionService.obtenerConfig(req.user.clienteId)
    return new SuccessResponseDto(datos)
  }

  @Put('calificacion-config')
  async guardarConfigCalificacion(@Body() body: any, @Request() req: any): Promise<SuccessResponseDto> {
    await this.calificacionService.guardarConfig(req.user.clienteId, body, req.user.id)
    return new SuccessResponseDto(null, 'Configuración guardada')
  }

  @Post('calificar-lote')
  async calificarLote(@Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.calificacionService.calificarLote(req.user.clienteId)
    return new SuccessResponseDto(datos, `Calificadas: ${datos.calificadas}, errores: ${datos.errores}`)
  }

  @Get(':id')
  async obtener(@Param('id') id: string): Promise<SuccessResponseDto> {
    const datos = await this.conversacionService.obtener(id)
    return new SuccessResponseDto(datos)
  }

  @Post()
  async crear(@Body() dto: CreateConversacionDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.conversacionService.crear(dto, req.user.id, req.user.clienteId)
    return new SuccessResponseDto(datos, 'Conversación creada')
  }

  @Post(':id/mensajes')
  async agregarMensaje(
    @Param('id') id: string,
    @Body() dto: AgregarMensajeDto,
  ): Promise<SuccessResponseDto> {
    const datos = await this.conversacionService.agregarMensaje(id, dto)
    return new SuccessResponseDto(datos)
  }

  @Post(':id/calificar')
  async calificarConIA(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.calificacionService.calificarConIA(id, req.user.clienteId)
    return new SuccessResponseDto(datos, `Score asignado: ${datos.score}`)
  }

  @Patch(':id/score')
  async actualizarScore(
    @Param('id') id: string,
    @Body('score') score: number,
  ): Promise<SuccessResponseDto> {
    await this.conversacionService.actualizarScore(id, score)
    return new SuccessResponseDto(null, 'Score actualizado')
  }

  @Patch(':id/estado')
  async actualizarEstado(
    @Param('id') id: string,
    @Body('estadoConversacion') estadoConversacion: string,
  ): Promise<SuccessResponseDto> {
    await this.conversacionService.actualizarEstado(id, estadoConversacion)
    return new SuccessResponseDto(null, 'Estado actualizado')
  }
}
