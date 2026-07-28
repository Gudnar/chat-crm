import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { ServicioAgenteService } from '../service/servicio-agente.service'
import { CreateServicioAgenteDto, UpdateServicioAgenteDto } from '../dto/servicio-agente.dto'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'

@ApiTags('Servicios de Agente')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('servicios-agente')
export class ServicioAgenteController {
  constructor(private readonly servicioAgenteService: ServicioAgenteService) {}

  @Get()
  async listar(@Query('agenteId') agenteId: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.servicioAgenteService.listarPorAgente(agenteId, req.user.clienteId)
    return new SuccessResponseDto(datos)
  }

  @Get(':id')
  async obtener(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.servicioAgenteService.obtener(id, req.user.clienteId)
    return new SuccessResponseDto(datos)
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async crear(@Body() dto: CreateServicioAgenteDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.servicioAgenteService.crear(dto, req.user.id, req.user.clienteId)
    return new SuccessResponseDto(datos, 'Servicio creado')
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateServicioAgenteDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.servicioAgenteService.actualizar(id, dto, req.user.id, req.user.clienteId)
    return new SuccessResponseDto(datos, 'Servicio actualizado')
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async eliminar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    await this.servicioAgenteService.eliminar(id, req.user.id, req.user.clienteId)
    return new SuccessResponseDto(null, 'Servicio eliminado')
  }
}
