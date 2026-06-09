import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ConfiguracionService } from '../service/configuracion.service'
import { SetConfiguracionDto, VerificarApiKeyDto } from '../dto/configuracion.dto'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'
import { Messages } from '../../../common/constants/response-messages'

@ApiTags('Configuración')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard)
@Controller('configuracion')
export class ConfiguracionController {
  constructor(private readonly configuracionService: ConfiguracionService) {}

  @Get()
  async listar(): Promise<SuccessResponseDto> {
    const datos = await this.configuracionService.listar()
    return new SuccessResponseDto(datos)
  }

  @Post()
  async set(@Body() dto: SetConfiguracionDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.configuracionService.set(dto, req.user.id)
    return new SuccessResponseDto(datos, Messages.CONFIGURACION_SAVED)
  }

  @Post('verificar-api-key')
  async verificarApiKey(@Body() dto: VerificarApiKeyDto): Promise<SuccessResponseDto> {
    const resultado = await this.configuracionService.verificarApiKey(dto)
    return new SuccessResponseDto(resultado, resultado.mensaje)
  }
}
