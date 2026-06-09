import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AgenteService } from '../service/agente.service'
import { CreateAgenteDto, UpdateAgenteDto } from '../dto/create-agente.dto'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'
import { Messages } from '../../../common/constants/response-messages'

@ApiTags('Agentes IA')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard)
@Controller('agentes')
export class AgenteController {
  constructor(private readonly agenteService: AgenteService) {}

  @Get()
  async listar(@Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.agenteService.listar(req.user.clienteId)
    return new SuccessResponseDto(datos)
  }

  @Get(':id')
  async obtener(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.agenteService.obtener(id, req.user.clienteId)
    return new SuccessResponseDto(datos)
  }

  @Post()
  async crear(@Body() dto: CreateAgenteDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.agenteService.crear(dto, req.user.id, req.user.clienteId)
    return new SuccessResponseDto(datos, Messages.AGENTE_CREATED)
  }

  @Put(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateAgenteDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.agenteService.actualizar(id, dto, req.user.id, req.user.clienteId)
    return new SuccessResponseDto(datos, Messages.AGENTE_UPDATED)
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    await this.agenteService.eliminar(id, req.user.id, req.user.clienteId)
    return new SuccessResponseDto(null, Messages.SUCCESS_DELETE)
  }

  @Post(':id/test')
  async testConAgente(
    @Param('id') id: string,
    @Body('mensaje') mensaje: string,
    @Body('historial') historial: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.agenteService.testConAgente(id, mensaje, historial, req.user.clienteId)
    return new SuccessResponseDto(datos)
  }
}
