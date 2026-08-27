"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SucursalController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const sucursal_service_1 = require("../service/sucursal.service");
const inventario_sucursal_service_1 = require("../service/inventario-sucursal.service");
const cliente_final_service_1 = require("../service/cliente-final.service");
const pedido_service_1 = require("../service/pedido.service");
const transaccion_service_1 = require("../service/transaccion.service");
const caja_sucursal_service_1 = require("../service/caja-sucursal.service");
const create_sucursal_dto_1 = require("../dto/create-sucursal.dto");
const inventario_sucursal_dto_1 = require("../dto/inventario-sucursal.dto");
const cliente_final_dto_1 = require("../dto/cliente-final.dto");
const pedido_dto_1 = require("../dto/pedido.dto");
const transaccion_dto_1 = require("../dto/transaccion.dto");
const caja_sucursal_dto_1 = require("../dto/caja-sucursal.dto");
const clienteIdDe = (req) => {
    const clienteId = req.user?.clienteId;
    if (!clienteId)
        throw new Error('Cliente no identificado');
    return clienteId;
};
let SucursalController = class SucursalController {
    constructor(sucursalService, inventarioService, clienteFinalService, pedidoService, transaccionService, cajaService) {
        this.sucursalService = sucursalService;
        this.inventarioService = inventarioService;
        this.clienteFinalService = clienteFinalService;
        this.pedidoService = pedidoService;
        this.transaccionService = transaccionService;
        this.cajaService = cajaService;
    }
    async listar(req) {
        const clienteId = clienteIdDe(req);
        return this.sucursalService.listar(clienteId);
    }
    async crear(dto, req) {
        const clienteId = clienteIdDe(req);
        return this.sucursalService.crear(dto, clienteId, req.user.id);
    }
    async listarInventario(sucursalId, req) {
        await this.sucursalService.obtener(sucursalId, clienteIdDe(req));
        return this.inventarioService.listarPorSucursal(sucursalId);
    }
    async crearInventario(sucursalId, dto, req) {
        const clienteId = clienteIdDe(req);
        await this.sucursalService.obtener(sucursalId, clienteId);
        return this.inventarioService.crear(sucursalId, dto, req.user.id);
    }
    async actualizarInventario(sucursalId, id, dto, req) {
        await this.sucursalService.obtener(sucursalId, clienteIdDe(req));
        return this.inventarioService.actualizar(id, sucursalId, dto, req.user.id);
    }
    async eliminarInventario(sucursalId, id, req) {
        await this.sucursalService.obtener(sucursalId, clienteIdDe(req));
        await this.inventarioService.eliminar(id, sucursalId, req.user.id);
        return { finalizado: true, mensaje: 'Inventario eliminado', datos: null };
    }
    async listarPedidos(sucursalId, req, estado) {
        await this.sucursalService.obtener(sucursalId, clienteIdDe(req));
        return this.pedidoService.listarPorSucursal(sucursalId, estado);
    }
    async crearPedido(sucursalId, dto, req) {
        const clienteId = clienteIdDe(req);
        await this.sucursalService.obtener(sucursalId, clienteId);
        dto.sucursalId = sucursalId;
        return this.pedidoService.crear(clienteId, dto, req.user.id);
    }
    async cambiarEstadoPedido(id, dto, req) {
        const clienteId = clienteIdDe(req);
        return this.pedidoService.cambiarEstado(id, clienteId, dto, req.user.id);
    }
    async cambiarEstadoPago(id, dto, req) {
        const clienteId = clienteIdDe(req);
        return this.pedidoService.cambiarEstadoPago(id, clienteId, dto, req.user.id);
    }
    async listarClientes(sucursalId, req) {
        const clienteId = clienteIdDe(req);
        await this.sucursalService.obtener(sucursalId, clienteId);
        return this.clienteFinalService.listarPorCliente(clienteId, sucursalId);
    }
    async crearCliente(sucursalId, dto, req) {
        const clienteId = clienteIdDe(req);
        await this.sucursalService.obtener(sucursalId, clienteId);
        dto.sucursalId = sucursalId;
        return this.clienteFinalService.crear(clienteId, dto, req.user.id);
    }
    async actualizarCliente(sucursalId, clienteFinalId, dto, req) {
        const clienteId = clienteIdDe(req);
        await this.sucursalService.obtener(sucursalId, clienteId);
        return this.clienteFinalService.actualizar(clienteFinalId, clienteId, dto, req.user.id);
    }
    async listarCajas(sucursalId, req) {
        await this.sucursalService.obtener(sucursalId, clienteIdDe(req));
        return this.cajaService.listarCajasPorSucursal(sucursalId);
    }
    async abrirCaja(sucursalId, dto, req) {
        const clienteId = clienteIdDe(req);
        await this.sucursalService.obtener(sucursalId, clienteId);
        return this.cajaService.abrirCaja(clienteId, sucursalId, req.user.id, dto, req.user.id);
    }
    async cerrarCaja(sucursalId, cajaId, dto, req) {
        const clienteId = clienteIdDe(req);
        await this.sucursalService.obtener(sucursalId, clienteId);
        return this.cajaService.cerrarCaja(cajaId, sucursalId, clienteId, dto, req.user.id);
    }
    async listarTransacciones(sucursalId, req) {
        await this.sucursalService.obtener(sucursalId, clienteIdDe(req));
        return this.transaccionService.listarPorSucursal(sucursalId);
    }
    async crearTransaccion(sucursalId, dto, req) {
        const clienteId = clienteIdDe(req);
        await this.sucursalService.obtener(sucursalId, clienteId);
        return this.transaccionService.crear(clienteId, sucursalId, dto, req.user.id);
    }
    async resumen(id, req) {
        const clienteId = clienteIdDe(req);
        return this.sucursalService.resumen(id, clienteId);
    }
    async obtener(id, req) {
        const clienteId = clienteIdDe(req);
        return this.sucursalService.obtener(id, clienteId);
    }
    async actualizar(id, dto, req) {
        const clienteId = clienteIdDe(req);
        return this.sucursalService.actualizar(id, dto, clienteId, req.user.id);
    }
    async eliminar(id, req) {
        const clienteId = clienteIdDe(req);
        await this.sucursalService.eliminar(id, clienteId, req.user.id);
        return { finalizado: true, mensaje: 'Sucursal eliminada', datos: null };
    }
};
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar sucursales' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SucursalController.prototype, "listar", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear sucursal' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sucursal_dto_1.CreateSucursalDto, Object]),
    __metadata("design:returntype", Promise)
], SucursalController.prototype, "crear", null);
__decorate([
    (0, common_1.Get)(':sucursalId/inventario'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar inventario de sucursal' }),
    __param(0, (0, common_1.Param)('sucursalId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SucursalController.prototype, "listarInventario", null);
__decorate([
    (0, common_1.Post)(':sucursalId/inventario'),
    (0, swagger_1.ApiOperation)({ summary: 'Agregar producto al inventario' }),
    __param(0, (0, common_1.Param)('sucursalId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, inventario_sucursal_dto_1.CreateInventarioSucursalDto, Object]),
    __metadata("design:returntype", Promise)
], SucursalController.prototype, "crearInventario", null);
__decorate([
    (0, common_1.Put)(':sucursalId/inventario/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar inventario' }),
    __param(0, (0, common_1.Param)('sucursalId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, inventario_sucursal_dto_1.UpdateInventarioSucursalDto, Object]),
    __metadata("design:returntype", Promise)
], SucursalController.prototype, "actualizarInventario", null);
__decorate([
    (0, common_1.Delete)(':sucursalId/inventario/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar producto del inventario' }),
    __param(0, (0, common_1.Param)('sucursalId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SucursalController.prototype, "eliminarInventario", null);
__decorate([
    (0, common_1.Get)(':sucursalId/pedidos'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar pedidos de sucursal' }),
    __param(0, (0, common_1.Param)('sucursalId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('estado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], SucursalController.prototype, "listarPedidos", null);
__decorate([
    (0, common_1.Post)(':sucursalId/pedidos'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear pedido' }),
    __param(0, (0, common_1.Param)('sucursalId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pedido_dto_1.CreatePedidoDto, Object]),
    __metadata("design:returntype", Promise)
], SucursalController.prototype, "crearPedido", null);
__decorate([
    (0, common_1.Patch)('pedidos/:id/estado'),
    (0, swagger_1.ApiOperation)({ summary: 'Cambiar estado del pedido' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pedido_dto_1.UpdatePedidoEstadoDto, Object]),
    __metadata("design:returntype", Promise)
], SucursalController.prototype, "cambiarEstadoPedido", null);
__decorate([
    (0, common_1.Patch)('pedidos/:id/pago'),
    (0, swagger_1.ApiOperation)({ summary: 'Cambiar estado de pago' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pedido_dto_1.UpdatePedidoEstadoPagoDto, Object]),
    __metadata("design:returntype", Promise)
], SucursalController.prototype, "cambiarEstadoPago", null);
__decorate([
    (0, common_1.Get)(':sucursalId/clientes'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar clientes finales' }),
    __param(0, (0, common_1.Param)('sucursalId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SucursalController.prototype, "listarClientes", null);
__decorate([
    (0, common_1.Post)(':sucursalId/clientes'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear cliente final' }),
    __param(0, (0, common_1.Param)('sucursalId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cliente_final_dto_1.CreateClienteFinalDto, Object]),
    __metadata("design:returntype", Promise)
], SucursalController.prototype, "crearCliente", null);
__decorate([
    (0, common_1.Put)(':sucursalId/clientes/:clienteFinalId'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar cliente final' }),
    __param(0, (0, common_1.Param)('sucursalId')),
    __param(1, (0, common_1.Param)('clienteFinalId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, cliente_final_dto_1.UpdateClienteFinalDto, Object]),
    __metadata("design:returntype", Promise)
], SucursalController.prototype, "actualizarCliente", null);
__decorate([
    (0, common_1.Get)(':sucursalId/cajas'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar cajas de sucursal' }),
    __param(0, (0, common_1.Param)('sucursalId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SucursalController.prototype, "listarCajas", null);
__decorate([
    (0, common_1.Post)(':sucursalId/caja/abrir'),
    (0, swagger_1.ApiOperation)({ summary: 'Abrir caja' }),
    __param(0, (0, common_1.Param)('sucursalId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, caja_sucursal_dto_1.AbrirCajaDto, Object]),
    __metadata("design:returntype", Promise)
], SucursalController.prototype, "abrirCaja", null);
__decorate([
    (0, common_1.Post)(':sucursalId/caja/:cajaId/cerrar'),
    (0, swagger_1.ApiOperation)({ summary: 'Cerrar caja' }),
    __param(0, (0, common_1.Param)('sucursalId')),
    __param(1, (0, common_1.Param)('cajaId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, caja_sucursal_dto_1.CerrarCajaDto, Object]),
    __metadata("design:returntype", Promise)
], SucursalController.prototype, "cerrarCaja", null);
__decorate([
    (0, common_1.Get)(':sucursalId/transacciones'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar transacciones de sucursal' }),
    __param(0, (0, common_1.Param)('sucursalId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SucursalController.prototype, "listarTransacciones", null);
__decorate([
    (0, common_1.Post)(':sucursalId/transacciones'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar transacción' }),
    __param(0, (0, common_1.Param)('sucursalId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transaccion_dto_1.CreateTransaccionDto, Object]),
    __metadata("design:returntype", Promise)
], SucursalController.prototype, "crearTransaccion", null);
__decorate([
    (0, common_1.Get)(':id/resumen'),
    (0, swagger_1.ApiOperation)({ summary: 'Resumen de sucursal (pedidos, stock, caja)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SucursalController.prototype, "resumen", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener sucursal' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SucursalController.prototype, "obtener", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar sucursal' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_sucursal_dto_1.UpdateSucursalDto, Object]),
    __metadata("design:returntype", Promise)
], SucursalController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar sucursal' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SucursalController.prototype, "eliminar", null);
SucursalController = __decorate([
    (0, swagger_1.ApiTags)('Sucursales'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE'),
    (0, common_1.Controller)('sucursales'),
    __metadata("design:paramtypes", [sucursal_service_1.SucursalService,
        inventario_sucursal_service_1.InventarioSucursalService,
        cliente_final_service_1.ClienteFinalService,
        pedido_service_1.PedidoService,
        transaccion_service_1.TransaccionService,
        caja_sucursal_service_1.CajaSucursalService])
], SucursalController);
exports.SucursalController = SucursalController;
//# sourceMappingURL=sucursal.controller.js.map