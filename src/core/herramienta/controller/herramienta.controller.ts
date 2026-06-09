import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common'
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
    await this.agenteService.obtener(agenteId, req.user.clienteId)
    const datos = await this.herramientaService.listarPorAgente(agenteId)
    return new SuccessResponseDto(datos)
  }

  @Post()
  async crear(@Body() dto: CreateHerramientaDto, @Request() req: any): Promise<SuccessResponseDto> {
    await this.agenteService.obtener(dto.agenteId, req.user.clienteId)
    const datos = await this.herramientaService.crear(dto, req.user.id)
    return new SuccessResponseDto(datos, Messages.SUCCESS_CREATE)
  }

  @Put(':id')
  async actualizar(@Param('id') id: string, @Body() dto: UpdateHerramientaDto, @Request() req: any): Promise<SuccessResponseDto> {
    const h = await this.herramientaService.obtener(id)
    await this.agenteService.obtener(h.agenteId, req.user.clienteId)
    const datos = await this.herramientaService.actualizar(id, dto, req.user.id)
    return new SuccessResponseDto(datos, Messages.SUCCESS_UPDATE)
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const h = await this.herramientaService.obtener(id)
    await this.agenteService.obtener(h.agenteId, req.user.clienteId)
    await this.herramientaService.eliminar(id, req.user.id)
    return new SuccessResponseDto(null, Messages.SUCCESS_DELETE)
  }
}
