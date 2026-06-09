import {
  Controller, Get, Put, Post, Delete,
  Body, Param, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { MiCuentaService } from '../service/mi-cuenta.service'
import {
  UpdateMiCuentaDto,
  CreateUsuarioClienteDto,
  UpdateUsuarioClienteDto,
  CreateRolClienteDto,
  UpdateRolClienteDto,
} from '../dto/mi-cuenta.dto'
import { Messages } from '../../../common/constants/response-messages'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_CLIENTE')
@Controller('mi-cuenta')
export class MiCuentaController {
  constructor(private readonly svc: MiCuentaService) {}

  // ── Empresa ──────────────────────────────────────────────────────────────

  @Get()
  async obtener(@Req() req: any) {
    const datos = await this.svc.obtenerCliente(req.user.clienteId)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Put()
  async actualizar(@Req() req: any, @Body() dto: UpdateMiCuentaDto) {
    const datos = await this.svc.actualizarCliente(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  // ── Roles ─────────────────────────────────────────────────────────────────

  @Get('roles')
  async listarRoles(@Req() req: any) {
    const roles = await this.svc.listarRoles(req.user.clienteId)
    const conteos = await this.svc.contarUsuariosPorRol(req.user.clienteId)
    const datos = roles.map(r => ({ ...r, totalUsuarios: conteos[r.id] ?? 0 }))
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post('roles')
  @HttpCode(HttpStatus.CREATED)
  async crearRol(@Req() req: any, @Body() dto: CreateRolClienteDto) {
    const datos = await this.svc.crearRol(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  @Put('roles/:id')
  async actualizarRol(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateRolClienteDto) {
    const datos = await this.svc.actualizarRol(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  @Delete('roles/:id')
  async eliminarRol(@Req() req: any, @Param('id') id: string) {
    await this.svc.eliminarRol(req.user.clienteId, id, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_DELETE, datos: null }
  }

  // ── Usuarios ──────────────────────────────────────────────────────────────

  @Get('usuarios')
  async listarUsuarios(@Req() req: any) {
    const datos = await this.svc.listarUsuarios(req.user.clienteId)
    return { finalizado: true, mensaje: 'OK', datos }
  }

  @Post('usuarios')
  @HttpCode(HttpStatus.CREATED)
  async crearUsuario(@Req() req: any, @Body() dto: CreateUsuarioClienteDto) {
    const datos = await this.svc.crearUsuario(req.user.clienteId, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_CREATE, datos }
  }

  @Put('usuarios/:id')
  async actualizarUsuario(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateUsuarioClienteDto) {
    const datos = await this.svc.actualizarUsuario(req.user.clienteId, id, dto, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_UPDATE, datos }
  }

  @Delete('usuarios/:id')
  async eliminarUsuario(@Req() req: any, @Param('id') id: string) {
    await this.svc.eliminarUsuario(req.user.clienteId, id, req.user.id)
    return { finalizado: true, mensaje: Messages.SUCCESS_DELETE, datos: null }
  }
}
