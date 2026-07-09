import {
  Body, Controller, Delete, Get, Param, Post, Put, Request, Res,
  UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
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

  @Get('exportar/excel')
  async exportarExcel(
    @Param('agenteId') agenteId: string,
    @Request() req: any,
    @Res() res: Response,
  ): Promise<void> {
    await this.agenteService.obtener(agenteId, req.user.clienteId)
    const buffer = await this.baseConocimientoService.exportarExcel(agenteId)
    const fecha = new Date().toISOString().split('T')[0]
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="base-conocimiento-agente${agenteId}-${fecha}.xlsx"`,
    })
    res.send(buffer)
  }

  @Post('importar/excel')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('archivo'))
  async importarExcel(
    @Param('agenteId') agenteId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    await this.agenteService.obtener(agenteId, req.user.clienteId)
    if (!file) return new SuccessResponseDto(null, 'Archivo requerido')
    const resultado = await this.baseConocimientoService.importarExcel(file.buffer, agenteId, req.user.id)
    return new SuccessResponseDto(
      resultado,
      `Importación completada: ${resultado.creadas} creadas, ${resultado.actualizadas} actualizadas`,
    )
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
