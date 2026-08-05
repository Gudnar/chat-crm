import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { FlowWhatsappService } from '../service/flow-whatsapp.service'
import { CreateFlowWhatsappDto, UpdateFlowWhatsappDto } from '../dto/flow-whatsapp.dto'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'

@ApiTags('Flows WhatsApp')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard)
@Controller('flows-whatsapp')
export class FlowWhatsappController {
  constructor(private readonly flowService: FlowWhatsappService) {}

  @Get()
  async listar(@Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.flowService.listar(this.clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  @Get(':id')
  async obtener(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.flowService.obtener(id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  @Post()
  async crear(@Body() dto: CreateFlowWhatsappDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.flowService.crear(dto, this.clienteIdDe(req), req.user.id)
    return new SuccessResponseDto(datos, 'Flow creado en borrador')
  }

  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() dto: UpdateFlowWhatsappDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.flowService.actualizar(id, dto, this.clienteIdDe(req), req.user.id)
    return new SuccessResponseDto(datos, 'Flow actualizado')
  }

  @Post(':id/publicar')
  async publicar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.flowService.publicar(id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos, 'Flow publicado')
  }

  @Post(':id/sincronizar')
  async sincronizar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.flowService.sincronizarEstado(id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos, 'Estado sincronizado con Meta')
  }

  @Get(':id/preview')
  async preview(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const previewUrl = await this.flowService.obtenerPreviewUrl(id, this.clienteIdDe(req))
    return new SuccessResponseDto({ previewUrl })
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    await this.flowService.eliminar(id, this.clienteIdDe(req), req.user.id)
    return new SuccessResponseDto(null, 'Flow eliminado')
  }

  private clienteIdDe(req: any): string {
    const deSesion = req.user?.clienteId
    if (deSesion) return String(deSesion)
    const deQuery = req.query?.clienteId
    if (deQuery) return String(deQuery)
    throw new BadRequestException('Debes indicar el cliente a administrar (parámetro clienteId)')
  }
}
