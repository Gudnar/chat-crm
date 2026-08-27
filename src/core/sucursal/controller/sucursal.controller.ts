import { Controller, Get, Post, Put, Delete, Patch, Param, Body, UseGuards, Req, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { SucursalService } from '../service/sucursal.service'
import { InventarioSucursalService } from '../service/inventario-sucursal.service'
import { ClienteFinalService } from '../service/cliente-final.service'
import { PedidoService } from '../service/pedido.service'
import { TransaccionService } from '../service/transaccion.service'
import { CajaSucursalService } from '../service/caja-sucursal.service'
import { CreateSucursalDto, UpdateSucursalDto } from '../dto/create-sucursal.dto'
import { CreateInventarioSucursalDto, UpdateInventarioSucursalDto, AjustarStockDto } from '../dto/inventario-sucursal.dto'
import { CreateClienteFinalDto, UpdateClienteFinalDto } from '../dto/cliente-final.dto'
import { CreatePedidoDto, UpdatePedidoEstadoDto, UpdatePedidoEstadoPagoDto } from '../dto/pedido.dto'
import { CreateTransaccionDto } from '../dto/transaccion.dto'
import { AbrirCajaDto, CerrarCajaDto } from '../dto/caja-sucursal.dto'

const clienteIdDe = (req: any): string => {
  const clienteId = req.user?.clienteId
  if (!clienteId) throw new Error('Cliente no identificado')
  return clienteId
}

@ApiTags('Sucursales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
@Controller('sucursales')
export class SucursalController {
  constructor(
    private readonly sucursalService: SucursalService,
    private readonly inventarioService: InventarioSucursalService,
    private readonly clienteFinalService: ClienteFinalService,
    private readonly pedidoService: PedidoService,
    private readonly transaccionService: TransaccionService,
    private readonly cajaService: CajaSucursalService,
  ) {}

  // ── SUCURSAL ──────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Listar sucursales' })
  async listar(@Req() req: any) {
    const clienteId = clienteIdDe(req)
    return this.sucursalService.listar(clienteId)
  }

  @Post()
  @ApiOperation({ summary: 'Crear sucursal' })
  async crear(@Body() dto: CreateSucursalDto, @Req() req: any) {
    const clienteId = clienteIdDe(req)
    return this.sucursalService.crear(dto, clienteId, req.user.id)
  }

  // ── INVENTARIO POR SUCURSAL ────────────────────────────
  @Get(':sucursalId/inventario')
  @ApiOperation({ summary: 'Listar inventario de sucursal' })
  async listarInventario(@Param('sucursalId') sucursalId: string, @Req() req: any) {
    await this.sucursalService.obtener(sucursalId, clienteIdDe(req))
    return this.inventarioService.listarPorSucursal(sucursalId)
  }

  @Post(':sucursalId/inventario')
  @ApiOperation({ summary: 'Agregar producto al inventario' })
  async crearInventario(
    @Param('sucursalId') sucursalId: string,
    @Body() dto: CreateInventarioSucursalDto,
    @Req() req: any,
  ) {
    const clienteId = clienteIdDe(req)
    await this.sucursalService.obtener(sucursalId, clienteId)
    return this.inventarioService.crear(sucursalId, dto, req.user.id)
  }

  @Put(':sucursalId/inventario/:id')
  @ApiOperation({ summary: 'Actualizar inventario' })
  async actualizarInventario(
    @Param('sucursalId') sucursalId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInventarioSucursalDto,
    @Req() req: any,
  ) {
    await this.sucursalService.obtener(sucursalId, clienteIdDe(req))
    return this.inventarioService.actualizar(id, sucursalId, dto, req.user.id)
  }

  @Delete(':sucursalId/inventario/:id')
  @ApiOperation({ summary: 'Eliminar producto del inventario' })
  async eliminarInventario(
    @Param('sucursalId') sucursalId: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    await this.sucursalService.obtener(sucursalId, clienteIdDe(req))
    await this.inventarioService.eliminar(id, sucursalId, req.user.id)
    return { finalizado: true, mensaje: 'Inventario eliminado', datos: null }
  }

  // ── PEDIDOS ────────────────────────────────────────────
  @Get(':sucursalId/pedidos')
  @ApiOperation({ summary: 'Listar pedidos de sucursal' })
  async listarPedidos(@Param('sucursalId') sucursalId: string, @Req() req: any, @Query('estado') estado?: string) {
    await this.sucursalService.obtener(sucursalId, clienteIdDe(req))
    return this.pedidoService.listarPorSucursal(sucursalId, estado)
  }

  @Post(':sucursalId/pedidos')
  @ApiOperation({ summary: 'Crear pedido' })
  async crearPedido(@Param('sucursalId') sucursalId: string, @Body() dto: CreatePedidoDto, @Req() req: any) {
    const clienteId = clienteIdDe(req)
    await this.sucursalService.obtener(sucursalId, clienteId)
    dto.sucursalId = sucursalId
    return this.pedidoService.crear(clienteId, dto, req.user.id)
  }

  @Patch('pedidos/:id/estado')
  @ApiOperation({ summary: 'Cambiar estado del pedido' })
  async cambiarEstadoPedido(@Param('id') id: string, @Body() dto: UpdatePedidoEstadoDto, @Req() req: any) {
    const clienteId = clienteIdDe(req)
    return this.pedidoService.cambiarEstado(id, clienteId, dto, req.user.id)
  }

  @Patch('pedidos/:id/pago')
  @ApiOperation({ summary: 'Cambiar estado de pago' })
  async cambiarEstadoPago(@Param('id') id: string, @Body() dto: UpdatePedidoEstadoPagoDto, @Req() req: any) {
    const clienteId = clienteIdDe(req)
    return this.pedidoService.cambiarEstadoPago(id, clienteId, dto, req.user.id)
  }

  // ── CLIENTES FINALES ───────────────────────────────────
  @Get(':sucursalId/clientes')
  @ApiOperation({ summary: 'Listar clientes finales' })
  async listarClientes(@Param('sucursalId') sucursalId: string, @Req() req: any) {
    const clienteId = clienteIdDe(req)
    await this.sucursalService.obtener(sucursalId, clienteId)
    return this.clienteFinalService.listarPorCliente(clienteId, sucursalId)
  }

  @Post(':sucursalId/clientes')
  @ApiOperation({ summary: 'Crear cliente final' })
  async crearCliente(@Param('sucursalId') sucursalId: string, @Body() dto: CreateClienteFinalDto, @Req() req: any) {
    const clienteId = clienteIdDe(req)
    await this.sucursalService.obtener(sucursalId, clienteId)
    dto.sucursalId = sucursalId
    return this.clienteFinalService.crear(clienteId, dto, req.user.id)
  }

  @Put(':sucursalId/clientes/:clienteFinalId')
  @ApiOperation({ summary: 'Actualizar cliente final' })
  async actualizarCliente(
    @Param('sucursalId') sucursalId: string,
    @Param('clienteFinalId') clienteFinalId: string,
    @Body() dto: UpdateClienteFinalDto,
    @Req() req: any,
  ) {
    const clienteId = clienteIdDe(req)
    await this.sucursalService.obtener(sucursalId, clienteId)
    return this.clienteFinalService.actualizar(clienteFinalId, clienteId, dto, req.user.id)
  }

  // ── CAJA ───────────────────────────────────────────────
  @Get(':sucursalId/cajas')
  @ApiOperation({ summary: 'Listar cajas de sucursal' })
  async listarCajas(@Param('sucursalId') sucursalId: string, @Req() req: any) {
    await this.sucursalService.obtener(sucursalId, clienteIdDe(req))
    return this.cajaService.listarCajasPorSucursal(sucursalId)
  }

  @Post(':sucursalId/caja/abrir')
  @ApiOperation({ summary: 'Abrir caja' })
  async abrirCaja(@Param('sucursalId') sucursalId: string, @Body() dto: AbrirCajaDto, @Req() req: any) {
    const clienteId = clienteIdDe(req)
    await this.sucursalService.obtener(sucursalId, clienteId)
    return this.cajaService.abrirCaja(clienteId, sucursalId, req.user.id, dto, req.user.id)
  }

  @Post(':sucursalId/caja/:cajaId/cerrar')
  @ApiOperation({ summary: 'Cerrar caja' })
  async cerrarCaja(@Param('sucursalId') sucursalId: string, @Param('cajaId') cajaId: string, @Body() dto: CerrarCajaDto, @Req() req: any) {
    const clienteId = clienteIdDe(req)
    await this.sucursalService.obtener(sucursalId, clienteId)
    return this.cajaService.cerrarCaja(cajaId, sucursalId, clienteId, dto, req.user.id)
  }

  @Get(':sucursalId/transacciones')
  @ApiOperation({ summary: 'Listar transacciones de sucursal' })
  async listarTransacciones(@Param('sucursalId') sucursalId: string, @Req() req: any) {
    await this.sucursalService.obtener(sucursalId, clienteIdDe(req))
    return this.transaccionService.listarPorSucursal(sucursalId)
  }

  @Post(':sucursalId/transacciones')
  @ApiOperation({ summary: 'Registrar transacción' })
  async crearTransaccion(@Param('sucursalId') sucursalId: string, @Body() dto: CreateTransaccionDto, @Req() req: any) {
    const clienteId = clienteIdDe(req)
    await this.sucursalService.obtener(sucursalId, clienteId)
    return this.transaccionService.crear(clienteId, sucursalId, dto, req.user.id)
  }

  // ── RUTAS GENÉRICAS (DEBEN IR AL FINAL) ────────────────
  @Get(':id/resumen')
  @ApiOperation({ summary: 'Resumen de sucursal (pedidos, stock, caja)' })
  async resumen(@Param('id') id: string, @Req() req: any) {
    const clienteId = clienteIdDe(req)
    return this.sucursalService.resumen(id, clienteId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener sucursal' })
  async obtener(@Param('id') id: string, @Req() req: any) {
    const clienteId = clienteIdDe(req)
    return this.sucursalService.obtener(id, clienteId)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar sucursal' })
  async actualizar(@Param('id') id: string, @Body() dto: UpdateSucursalDto, @Req() req: any) {
    const clienteId = clienteIdDe(req)
    return this.sucursalService.actualizar(id, dto, clienteId, req.user.id)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar sucursal' })
  async eliminar(@Param('id') id: string, @Req() req: any) {
    const clienteId = clienteIdDe(req)
    await this.sucursalService.eliminar(id, clienteId, req.user.id)
    return { finalizado: true, mensaje: 'Sucursal eliminada', datos: null }
  }
}
