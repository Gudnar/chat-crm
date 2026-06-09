import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { RedSocialService } from '../service/red-social.service'
import { CreateCuentaRedSocialDto, TestConexionMetaDto, UpdateCuentaRedSocialDto } from '../dto/red-social.dto'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'

@ApiTags('Redes Sociales por Cliente')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clientes/:clienteId/red-social')
export class RedSocialClienteController {
  constructor(private readonly redSocialService: RedSocialService) {}

  @Get('cuentas')
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async listarCuentas(
    @Param('clienteId') clienteId: string,
    @Query('plataforma') plataforma?: string,
  ) {
    const datos = await this.redSocialService.listarCuentas(clienteId, plataforma)
    return new SuccessResponseDto(datos)
  }

  @Post('cuentas')
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async crearCuenta(
    @Param('clienteId') clienteId: string,
    @Body() dto: CreateCuentaRedSocialDto,
    @Request() req: any,
  ) {
    const datos = await this.redSocialService.crearCuenta(dto, req.user.id, clienteId)
    return new SuccessResponseDto(datos, 'Cuenta creada correctamente')
  }

  @Put('cuentas/:id')
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async actualizarCuenta(
    @Param('clienteId') clienteId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCuentaRedSocialDto,
    @Request() req: any,
  ) {
    const datos = await this.redSocialService.actualizarCuenta(id, dto, req.user.id, clienteId)
    return new SuccessResponseDto(datos, 'Cuenta actualizada correctamente')
  }

  @Delete('cuentas/:id')
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async eliminarCuenta(
    @Param('clienteId') clienteId: string,
    @Param('id') id: string,
    @Request() req: any,
  ) {
    await this.redSocialService.eliminarCuenta(id, req.user.id, clienteId)
    return new SuccessResponseDto(null, 'Cuenta eliminada correctamente')
  }

  @Post('test-conexion')
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async testConexion(@Body() dto: TestConexionMetaDto) {
    const result = await this.redSocialService.testConexion(dto.accessToken, dto.pageId, dto.plataforma)
    return result
  }
}
