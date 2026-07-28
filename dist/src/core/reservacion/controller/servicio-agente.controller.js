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
exports.ServicioAgenteController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const servicio_agente_service_1 = require("../service/servicio-agente.service");
const servicio_agente_dto_1 = require("../dto/servicio-agente.dto");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
let ServicioAgenteController = class ServicioAgenteController {
    constructor(servicioAgenteService) {
        this.servicioAgenteService = servicioAgenteService;
    }
    async listar(agenteId, req) {
        const datos = await this.servicioAgenteService.listarPorAgente(agenteId, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async obtener(id, req) {
        const datos = await this.servicioAgenteService.obtener(id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crear(dto, req) {
        const datos = await this.servicioAgenteService.crear(dto, req.user.id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Servicio creado');
    }
    async actualizar(id, dto, req) {
        const datos = await this.servicioAgenteService.actualizar(id, dto, req.user.id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Servicio actualizado');
    }
    async eliminar(id, req) {
        await this.servicioAgenteService.eliminar(id, req.user.id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(null, 'Servicio eliminado');
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('agenteId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ServicioAgenteController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ServicioAgenteController.prototype, "obtener", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [servicio_agente_dto_1.CreateServicioAgenteDto, Object]),
    __metadata("design:returntype", Promise)
], ServicioAgenteController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, servicio_agente_dto_1.UpdateServicioAgenteDto, Object]),
    __metadata("design:returntype", Promise)
], ServicioAgenteController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ServicioAgenteController.prototype, "eliminar", null);
ServicioAgenteController = __decorate([
    (0, swagger_1.ApiTags)('Servicios de Agente'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('servicios-agente'),
    __metadata("design:paramtypes", [servicio_agente_service_1.ServicioAgenteService])
], ServicioAgenteController);
exports.ServicioAgenteController = ServicioAgenteController;
//# sourceMappingURL=servicio-agente.controller.js.map