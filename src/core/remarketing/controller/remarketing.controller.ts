import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { RemarketingService } from '../service/remarketing.service'
import { CreateCampanaDto } from '../dto/campana.dto'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'

@ApiTags('Remarketing')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard)
@Controller('remarketing')
export class RemarketingController {
  constructor(private readonly remarketingService: RemarketingService) {}

  @Get()
  async listar(@Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.remarketingService.listarCampanas(req.user.clienteId)
    return new SuccessResponseDto(datos)
  }

  @Post()
  async crear(@Body() dto: CreateCampanaDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.remarketingService.crearCampana(dto, req.user.id, req.user.clienteId)
    return new SuccessResponseDto(datos, 'Campaña creada')
  }

  @Get(':id')
  async obtener(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.remarketingService.obtenerCampana(id, req.user.clienteId)
    return new SuccessResponseDto(datos)
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    await this.remarketingService.eliminarCampana(id, req.user.id, req.user.clienteId)
    return new SuccessResponseDto(null, 'Campaña eliminada')
  }

  @Patch(':id/cancelar')
  async cancelar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    await this.remarketingService.cancelarCampana(id, req.user.id, req.user.clienteId)
    return new SuccessResponseDto(null, 'Campaña cancelada')
  }

  @Post(':id/ejecutar')
  async ejecutar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    await this.remarketingService.ejecutarCampanaAhora(id, req.user.clienteId)
    return new SuccessResponseDto(null, 'Campaña ejecutada')
  }
}
