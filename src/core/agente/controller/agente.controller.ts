import {
  BadRequestException,
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
    const datos = await this.agenteService.listar(this.clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  @Get(':id')
  async obtener(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.agenteService.obtener(id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  @Post()
  async crear(@Body() dto: CreateAgenteDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.agenteService.crear(dto, req.user.id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos, Messages.AGENTE_CREATED)
  }

  @Put(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateAgenteDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.agenteService.actualizar(id, dto, req.user.id, this.clienteIdDe(req))
    return new SuccessResponseDto(datos, Messages.AGENTE_UPDATED)
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    await this.agenteService.eliminar(id, req.user.id, this.clienteIdDe(req))
    return new SuccessResponseDto(null, Messages.SUCCESS_DELETE)
  }

  @Post(':id/test')
  async testConAgente(
    @Param('id') id: string,
    @Body('mensaje') mensaje: string,
    @Body('historial') historial: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.agenteService.testConAgente(id, mensaje, historial, this.clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  /**
   * SUPER_ADMIN (usuario.cliente_id NULL) administra agentes de un cliente concreto
   * seleccionado en el frontend. Sin este fallback, req.user.clienteId es null y
   * TypeORM ignora la condición null en el where, exponiendo/mezclando agentes de
   * TODOS los clientes (mismo gotcha ya resuelto en agentes-humanos).
   */
  private clienteIdDe(req: any): string {
    const deSesion = req.user?.clienteId
    if (deSesion) return String(deSesion)
    const deQuery = req.query?.clienteId
    if (deQuery) return String(deQuery)
    throw new BadRequestException('Debes indicar el cliente a administrar (parámetro clienteId)')
  }
}
