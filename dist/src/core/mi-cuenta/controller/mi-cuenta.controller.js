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
exports.MiCuentaController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const mi_cuenta_service_1 = require("../service/mi-cuenta.service");
const mi_cuenta_dto_1 = require("../dto/mi-cuenta.dto");
const response_messages_1 = require("../../../common/constants/response-messages");
let MiCuentaController = class MiCuentaController {
    constructor(svc) {
        this.svc = svc;
    }
    async obtener(req) {
        const datos = await this.svc.obtenerCliente(req.user.clienteId);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async actualizar(req, dto) {
        const datos = await this.svc.actualizarCliente(req.user.clienteId, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_UPDATE, datos };
    }
    async listarRoles(req) {
        const roles = await this.svc.listarRoles(req.user.clienteId);
        const conteos = await this.svc.contarUsuariosPorRol(req.user.clienteId);
        const datos = roles.map(r => ({ ...r, totalUsuarios: conteos[r.id] ?? 0 }));
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async crearRol(req, dto) {
        const datos = await this.svc.crearRol(req.user.clienteId, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_CREATE, datos };
    }
    async actualizarRol(req, id, dto) {
        const datos = await this.svc.actualizarRol(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_UPDATE, datos };
    }
    async eliminarRol(req, id) {
        await this.svc.eliminarRol(req.user.clienteId, id, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_DELETE, datos: null };
    }
    async listarUsuarios(req) {
        const datos = await this.svc.listarUsuarios(req.user.clienteId);
        return { finalizado: true, mensaje: 'OK', datos };
    }
    async crearUsuario(req, dto) {
        const datos = await this.svc.crearUsuario(req.user.clienteId, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_CREATE, datos };
    }
    async actualizarUsuario(req, id, dto) {
        const datos = await this.svc.actualizarUsuario(req.user.clienteId, id, dto, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_UPDATE, datos };
    }
    async eliminarUsuario(req, id) {
        await this.svc.eliminarUsuario(req.user.clienteId, id, req.user.id);
        return { finalizado: true, mensaje: response_messages_1.Messages.SUCCESS_DELETE, datos: null };
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MiCuentaController.prototype, "obtener", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mi_cuenta_dto_1.UpdateMiCuentaDto]),
    __metadata("design:returntype", Promise)
], MiCuentaController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Get)('roles'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MiCuentaController.prototype, "listarRoles", null);
__decorate([
    (0, common_1.Post)('roles'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mi_cuenta_dto_1.CreateRolClienteDto]),
    __metadata("design:returntype", Promise)
], MiCuentaController.prototype, "crearRol", null);
__decorate([
    (0, common_1.Put)('roles/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, mi_cuenta_dto_1.UpdateRolClienteDto]),
    __metadata("design:returntype", Promise)
], MiCuentaController.prototype, "actualizarRol", null);
__decorate([
    (0, common_1.Delete)('roles/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MiCuentaController.prototype, "eliminarRol", null);
__decorate([
    (0, common_1.Get)('usuarios'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MiCuentaController.prototype, "listarUsuarios", null);
__decorate([
    (0, common_1.Post)('usuarios'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mi_cuenta_dto_1.CreateUsuarioClienteDto]),
    __metadata("design:returntype", Promise)
], MiCuentaController.prototype, "crearUsuario", null);
__decorate([
    (0, common_1.Put)('usuarios/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, mi_cuenta_dto_1.UpdateUsuarioClienteDto]),
    __metadata("design:returntype", Promise)
], MiCuentaController.prototype, "actualizarUsuario", null);
__decorate([
    (0, common_1.Delete)('usuarios/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MiCuentaController.prototype, "eliminarUsuario", null);
MiCuentaController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN_CLIENTE'),
    (0, common_1.Controller)('mi-cuenta'),
    __metadata("design:paramtypes", [mi_cuenta_service_1.MiCuentaService])
], MiCuentaController);
exports.MiCuentaController = MiCuentaController;
//# sourceMappingURL=mi-cuenta.controller.js.map