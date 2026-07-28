import { Body, Controller, Delete, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { HorarioAgenteService } from '../service/horario-agente.service'
import { CreateHorarioAgenteDto } from '../dto/horario-agente.dto'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'

@ApiTags('Horarios de Agente')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('horarios-agente')
export class HorarioAgenteController {
  constructor(private readonly horarioAgenteService: HorarioAgenteService) {}

  @Get()
  async listar(@Query('agenteId') agenteId: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.horarioAgenteService.listarPorAgente(agenteId, req.user.clienteId)
    return new SuccessResponseDto(datos)
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async crear(@Body() dto: CreateHorarioAgenteDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.horarioAgenteService.crear(dto, req.user.id, req.user.clienteId)
    return new SuccessResponseDto(datos, 'Horario creado')
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async eliminar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    await this.horarioAgenteService.eliminar(id, req.user.id, req.user.clienteId)
    return new SuccessResponseDto(null, 'Horario eliminado')
  }
}
