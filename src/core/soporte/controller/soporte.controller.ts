import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { SoporteService } from '../service/soporte.service'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'

@ApiTags('Soporte')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard)
@Controller('soporte')
export class SoporteController {
  constructor(private readonly soporteService: SoporteService) {}

  @Get()
  async listar(@Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.soporteService.listar(req.user.clienteId)
    return new SuccessResponseDto(datos)
  }

  @Get('estadisticas')
  async estadisticas(@Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.soporteService.estadisticas(req.user.clienteId)
    return new SuccessResponseDto(datos)
  }

  @Get(':id')
  async obtener(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.soporteService.obtener(id, req.user.clienteId)
    return new SuccessResponseDto(datos)
  }

  @Post()
  async crear(
    @Body() body: any,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.soporteService.crear(
      body.titulo,
      body.descripcion,
      body.nombreContacto,
      body.prioridad || 'media',
      body.categoria,
      req.user.clienteId,
      req.user.id,
      body.conversacionId,
    )
    return new SuccessResponseDto(datos, 'Caso de soporte creado')
  }

  @Patch(':id/estado')
  async cambiarEstado(
    @Param('id') id: string,
    @Body('estadoCaso') estadoCaso: string,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.soporteService.cambiarEstado(id, req.user.clienteId, estadoCaso, req.user.id)
    return new SuccessResponseDto(datos, 'Estado actualizado')
  }

  @Patch(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.soporteService.actualizar(id, req.user.clienteId, {
      ...body,
      usuarioModificacion: req.user.id,
    })
    return new SuccessResponseDto(datos, 'Caso actualizado')
  }

  @Post(':id/notas')
  async agregarNota(
    @Param('id') id: string,
    @Body('nota') nota: string,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.soporteService.agregarNota(id, req.user.clienteId, nota, req.user.id)
    return new SuccessResponseDto(datos, 'Nota agregada')
  }
}
