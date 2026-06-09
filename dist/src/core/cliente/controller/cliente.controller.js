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
exports.ClienteController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const cliente_service_1 = require("../service/cliente.service");
const mi_cuenta_service_1 = require("../../mi-cuenta/service/mi-cuenta.service");
const cliente_dto_1 = require("../dto/cliente.dto");
const mi_cuenta_dto_1 = require("../../mi-cuenta/dto/mi-cuenta.dto");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
const response_messages_1 = require("../../../common/constants/response-messages");
let ClienteController = class ClienteController {
    constructor(clienteService, miCuentaService) {
        this.clienteService = clienteService;
        this.miCuentaService = miCuentaService;
    }
    async listar() {
        const datos = await this.clienteService.listar();
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async obtener(id) {
        const datos = await this.clienteService.obtener(id);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async resumen(id) {
        const datos = await this.clienteService.resumen(id);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crear(dto, req) {
        const datos = await this.clienteService.crear(dto, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, response_messages_1.Messages.SUCCESS_CREATE);
    }
    async actualizar(id, dto, req) {
        const datos = await this.clienteService.actualizar(id, dto, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, response_messages_1.Messages.SUCCESS_UPDATE);
    }
    async eliminar(id, req) {
        await this.clienteService.eliminar(id, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(null, response_messages_1.Messages.SUCCESS_DELETE);
    }
    async listarRoles(id) {
        const roles = await this.miCuentaService.listarRoles(id);
        const conteos = await this.miCuentaService.contarUsuariosPorRol(id);
        const datos = roles.map(r => ({ ...r, totalUsuarios: conteos[r.id] ?? 0 }));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async listarUsuarios(id) {
        const datos = await this.miCuentaService.listarUsuarios(id);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crearUsuario(id, dto, req) {
        const datos = await this.miCuentaService.crearUsuario(id, dto, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, response_messages_1.Messages.SUCCESS_CREATE);
    }
    async actualizarUsuario(id, userId, dto, req) {
        const datos = await this.miCuentaService.actualizarUsuario(id, userId, dto, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, response_messages_1.Messages.SUCCESS_UPDATE);
    }
    async eliminarUsuario(id, userId, req) {
        await this.miCuentaService.eliminarUsuario(id, userId, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(null, response_messages_1.Messages.SUCCESS_DELETE);
    }
};
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClienteController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClienteController.prototype, "obtener", null);
__decorate([
    (0, common_1.Get)(':id/resumen'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClienteController.prototype, "resumen", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cliente_dto_1.CreateClienteDto, Object]),
    __metadata("design:returntype", Promise)
], ClienteController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cliente_dto_1.UpdateClienteDto, Object]),
    __metadata("design:returntype", Promise)
], ClienteController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClienteController.prototype, "eliminar", null);
__decorate([
    (0, common_1.Get)(':id/roles'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClienteController.prototype, "listarRoles", null);
__decorate([
    (0, common_1.Get)(':id/usuarios'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClienteController.prototype, "listarUsuarios", null);
__decorate([
    (0, common_1.Post)(':id/usuarios'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, mi_cuenta_dto_1.CreateUsuarioClienteDto, Object]),
    __metadata("design:returntype", Promise)
], ClienteController.prototype, "crearUsuario", null);
__decorate([
    (0, common_1.Put)(':id/usuarios/:userId'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, mi_cuenta_dto_1.UpdateUsuarioClienteDto, Object]),
    __metadata("design:returntype", Promise)
], ClienteController.prototype, "actualizarUsuario", null);
__decorate([
    (0, common_1.Delete)(':id/usuarios/:userId'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ClienteController.prototype, "eliminarUsuario", null);
ClienteController = __decorate([
    (0, swagger_1.ApiTags)('Clientes'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('clientes'),
    __metadata("design:paramtypes", [cliente_service_1.ClienteService,
        mi_cuenta_service_1.MiCuentaService])
], ClienteController);
exports.ClienteController = ClienteController;
//# sourceMappingURL=cliente.controller.js.map