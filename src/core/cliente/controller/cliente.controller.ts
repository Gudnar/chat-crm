import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { ClienteService } from '../service/cliente.service'
import { MiCuentaService } from '../../mi-cuenta/service/mi-cuenta.service'
import { CreateClienteDto, UpdateClienteDto } from '../dto/cliente.dto'
import { CreateUsuarioClienteDto, UpdateUsuarioClienteDto } from '../../mi-cuenta/dto/mi-cuenta.dto'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'
import { Messages } from '../../../common/constants/response-messages'

@ApiTags('Clientes')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clientes')
export class ClienteController {
  constructor(
    private readonly clienteService: ClienteService,
    private readonly miCuentaService: MiCuentaService,
  ) {}

  @Get()
  @Roles('SUPER_ADMIN')
  async listar(): Promise<SuccessResponseDto> {
    const datos = await this.clienteService.listar()
    return new SuccessResponseDto(datos)
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async obtener(@Param('id') id: string): Promise<SuccessResponseDto> {
    const datos = await this.clienteService.obtener(id)
    return new SuccessResponseDto(datos)
  }

  @Get(':id/resumen')
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async resumen(@Param('id') id: string): Promise<SuccessResponseDto> {
    const datos = await this.clienteService.resumen(id)
    return new SuccessResponseDto(datos)
  }

  @Post()
  @Roles('SUPER_ADMIN')
  async crear(@Body() dto: CreateClienteDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.clienteService.crear(dto, req.user.id)
    return new SuccessResponseDto(datos, Messages.SUCCESS_CREATE)
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateClienteDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.clienteService.actualizar(id, dto, req.user.id)
    return new SuccessResponseDto(datos, Messages.SUCCESS_UPDATE)
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  async eliminar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    await this.clienteService.eliminar(id, req.user.id)
    return new SuccessResponseDto(null, Messages.SUCCESS_DELETE)
  }

  // ── Gestión de usuarios por cliente (SUPER_ADMIN) ────────────

  @Get(':id/roles')
  @Roles('SUPER_ADMIN')
  async listarRoles(@Param('id') id: string): Promise<SuccessResponseDto> {
    const roles = await this.miCuentaService.listarRoles(id)
    const conteos = await this.miCuentaService.contarUsuariosPorRol(id)
    const datos = roles.map(r => ({ ...r, totalUsuarios: conteos[r.id] ?? 0 }))
    return new SuccessResponseDto(datos)
  }

  @Get(':id/usuarios')
  @Roles('SUPER_ADMIN')
  async listarUsuarios(@Param('id') id: string): Promise<SuccessResponseDto> {
    const datos = await this.miCuentaService.listarUsuarios(id)
    return new SuccessResponseDto(datos)
  }

  @Post(':id/usuarios')
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async crearUsuario(
    @Param('id') id: string,
    @Body() dto: CreateUsuarioClienteDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.miCuentaService.crearUsuario(id, dto, req.user.id)
    return new SuccessResponseDto(datos, Messages.SUCCESS_CREATE)
  }

  @Put(':id/usuarios/:userId')
  @Roles('SUPER_ADMIN')
  async actualizarUsuario(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateUsuarioClienteDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.miCuentaService.actualizarUsuario(id, userId, dto, req.user.id)
    return new SuccessResponseDto(datos, Messages.SUCCESS_UPDATE)
  }

  @Delete(':id/usuarios/:userId')
  @Roles('SUPER_ADMIN')
  async eliminarUsuario(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    await this.miCuentaService.eliminarUsuario(id, userId, req.user.id)
    return new SuccessResponseDto(null, Messages.SUCCESS_DELETE)
  }
}
