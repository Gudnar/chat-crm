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
exports.ConfiguracionClienteController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const configuracion_cliente_service_1 = require("../service/configuracion-cliente.service");
const configuracion_cliente_dto_1 = require("../dto/configuracion-cliente.dto");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
const response_messages_1 = require("../../../common/constants/response-messages");
let ConfiguracionClienteController = class ConfiguracionClienteController {
    constructor(configuracionClienteService) {
        this.configuracionClienteService = configuracionClienteService;
    }
    async listar(clienteId) {
        const datos = await this.configuracionClienteService.listar(clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async set(clienteId, dto, req) {
        const datos = await this.configuracionClienteService.set(clienteId, dto, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, response_messages_1.Messages.CONFIGURACION_SAVED);
    }
    async eliminar(clienteId, clave, req) {
        await this.configuracionClienteService.eliminar(clienteId, clave, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(null, response_messages_1.Messages.SUCCESS_DELETE);
    }
};
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE'),
    __param(0, (0, common_1.Param)('clienteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfiguracionClienteController.prototype, "listar", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE'),
    __param(0, (0, common_1.Param)('clienteId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, configuracion_cliente_dto_1.SetConfiguracionClienteDto, Object]),
    __metadata("design:returntype", Promise)
], ConfiguracionClienteController.prototype, "set", null);
__decorate([
    (0, common_1.Delete)(':clave'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE'),
    __param(0, (0, common_1.Param)('clienteId')),
    __param(1, (0, common_1.Param)('clave')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ConfiguracionClienteController.prototype, "eliminar", null);
ConfiguracionClienteController = __decorate([
    (0, swagger_1.ApiTags)('Configuración por Cliente'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('clientes/:clienteId/configuracion'),
    __metadata("design:paramtypes", [configuracion_cliente_service_1.ConfiguracionClienteService])
], ConfiguracionClienteController);
exports.ConfiguracionClienteController = ConfiguracionClienteController;
//# sourceMappingURL=configuracion-cliente.controller.js.map