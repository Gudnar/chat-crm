import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { PlantillaWhatsappService } from '../service/plantilla-whatsapp.service'
import { CreatePlantillaWhatsappDto } from '../dto/plantilla-whatsapp.dto'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'

@ApiTags('Plantillas WhatsApp')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard)
@Controller('plantillas-whatsapp')
export class PlantillaWhatsappController {
  constructor(private readonly plantillaService: PlantillaWhatsappService) {}

  @Get()
  async listar(@Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.plantillaService.listar(this.clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  @Get(':id')
  async obtener(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.plantillaService.obtener(id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  @Post()
  async crear(@Body() dto: CreatePlantillaWhatsappDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.plantillaService.crear(dto, this.clienteIdDe(req), req.user.id)
    return new SuccessResponseDto(datos, 'Plantilla enviada a revisión de Meta')
  }

  @Post(':id/sincronizar')
  async sincronizar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.plantillaService.sincronizarEstado(id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos, 'Estado sincronizado con Meta')
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    await this.plantillaService.eliminar(id, this.clienteIdDe(req), req.user.id)
    return new SuccessResponseDto(null, 'Plantilla eliminada')
  }

  /** Mismo patrón que el resto de controllers: SUPER_ADMIN (clienteId null) necesita el query param. */
  private clienteIdDe(req: any): string {
    const deSesion = req.user?.clienteId
    if (deSesion) return String(deSesion)
    const deQuery = req.query?.clienteId
    if (deQuery) return String(deQuery)
    throw new BadRequestException('Debes indicar el cliente a administrar (parámetro clienteId)')
  }
}
