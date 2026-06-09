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
exports.RedSocialClienteController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const red_social_service_1 = require("../service/red-social.service");
const red_social_dto_1 = require("../dto/red-social.dto");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
let RedSocialClienteController = class RedSocialClienteController {
    constructor(redSocialService) {
        this.redSocialService = redSocialService;
    }
    async listarCuentas(clienteId, plataforma) {
        const datos = await this.redSocialService.listarCuentas(clienteId, plataforma);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crearCuenta(clienteId, dto, req) {
        const datos = await this.redSocialService.crearCuenta(dto, req.user.id, clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Cuenta creada correctamente');
    }
    async actualizarCuenta(clienteId, id, dto, req) {
        const datos = await this.redSocialService.actualizarCuenta(id, dto, req.user.id, clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Cuenta actualizada correctamente');
    }
    async eliminarCuenta(clienteId, id, req) {
        await this.redSocialService.eliminarCuenta(id, req.user.id, clienteId);
        return new success_response_dto_1.SuccessResponseDto(null, 'Cuenta eliminada correctamente');
    }
    async testConexion(dto) {
        const result = await this.redSocialService.testConexion(dto.accessToken, dto.pageId, dto.plataforma);
        return result;
    }
};
__decorate([
    (0, common_1.Get)('cuentas'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE'),
    __param(0, (0, common_1.Param)('clienteId')),
    __param(1, (0, common_1.Query)('plataforma')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RedSocialClienteController.prototype, "listarCuentas", null);
__decorate([
    (0, common_1.Post)('cuentas'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE'),
    __param(0, (0, common_1.Param)('clienteId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, red_social_dto_1.CreateCuentaRedSocialDto, Object]),
    __metadata("design:returntype", Promise)
], RedSocialClienteController.prototype, "crearCuenta", null);
__decorate([
    (0, common_1.Put)('cuentas/:id'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE'),
    __param(0, (0, common_1.Param)('clienteId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, red_social_dto_1.UpdateCuentaRedSocialDto, Object]),
    __metadata("design:returntype", Promise)
], RedSocialClienteController.prototype, "actualizarCuenta", null);
__decorate([
    (0, common_1.Delete)('cuentas/:id'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE'),
    __param(0, (0, common_1.Param)('clienteId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], RedSocialClienteController.prototype, "eliminarCuenta", null);
__decorate([
    (0, common_1.Post)('test-conexion'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [red_social_dto_1.TestConexionMetaDto]),
    __metadata("design:returntype", Promise)
], RedSocialClienteController.prototype, "testConexion", null);
RedSocialClienteController = __decorate([
    (0, swagger_1.ApiTags)('Redes Sociales por Cliente'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('clientes/:clienteId/red-social'),
    __metadata("design:paramtypes", [red_social_service_1.RedSocialService])
], RedSocialClienteController);
exports.RedSocialClienteController = RedSocialClienteController;
//# sourceMappingURL=red-social-cliente.controller.js.map