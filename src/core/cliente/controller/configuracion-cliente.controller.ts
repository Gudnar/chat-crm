import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { ConfiguracionClienteService } from '../service/configuracion-cliente.service'
import { SetConfiguracionClienteDto } from '../dto/configuracion-cliente.dto'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'
import { Messages } from '../../../common/constants/response-messages'

@ApiTags('Configuración por Cliente')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clientes/:clienteId/configuracion')
export class ConfiguracionClienteController {
  constructor(private readonly configuracionClienteService: ConfiguracionClienteService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async listar(@Param('clienteId') clienteId: string): Promise<SuccessResponseDto> {
    const datos = await this.configuracionClienteService.listar(clienteId)
    return new SuccessResponseDto(datos)
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async set(
    @Param('clienteId') clienteId: string,
    @Body() dto: SetConfiguracionClienteDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.configuracionClienteService.set(clienteId, dto, req.user.id)
    return new SuccessResponseDto(datos, Messages.CONFIGURACION_SAVED)
  }

  @Delete(':clave')
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async eliminar(
    @Param('clienteId') clienteId: string,
    @Param('clave') clave: string,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    await this.configuracionClienteService.eliminar(clienteId, clave, req.user.id)
    return new SuccessResponseDto(null, Messages.SUCCESS_DELETE)
  }
}
