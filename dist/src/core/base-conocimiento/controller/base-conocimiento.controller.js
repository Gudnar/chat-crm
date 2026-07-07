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
exports.BaseConocimientoController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const base_conocimiento_service_1 = require("../service/base-conocimiento.service");
const agente_service_1 = require("../../agente/service/agente.service");
const create_base_conocimiento_dto_1 = require("../dto/create-base-conocimiento.dto");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
let BaseConocimientoController = class BaseConocimientoController {
    constructor(baseConocimientoService, agenteService) {
        this.baseConocimientoService = baseConocimientoService;
        this.agenteService = agenteService;
    }
    async listar(agenteId, req) {
        await this.agenteService.obtener(agenteId, req.user.clienteId);
        const datos = await this.baseConocimientoService.listarPorAgente(agenteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crear(agenteId, dto, req) {
        await this.agenteService.obtener(agenteId, req.user.clienteId);
        const datos = await this.baseConocimientoService.crear({ ...dto, agenteId }, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Pregunta frecuente creada correctamente');
    }
    async actualizar(agenteId, id, dto, req) {
        await this.agenteService.obtener(agenteId, req.user.clienteId);
        const datos = await this.baseConocimientoService.actualizar(id, dto, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Pregunta frecuente actualizada correctamente');
    }
    async eliminar(agenteId, id, req) {
        await this.agenteService.obtener(agenteId, req.user.clienteId);
        await this.baseConocimientoService.eliminar(id, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(null, 'Pregunta frecuente eliminada correctamente');
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('agenteId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BaseConocimientoController.prototype, "listar", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('agenteId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_base_conocimiento_dto_1.CreateBaseConocimientoDto, Object]),
    __metadata("design:returntype", Promise)
], BaseConocimientoController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('agenteId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_base_conocimiento_dto_1.UpdateBaseConocimientoDto, Object]),
    __metadata("design:returntype", Promise)
], BaseConocimientoController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('agenteId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], BaseConocimientoController.prototype, "eliminar", null);
BaseConocimientoController = __decorate([
    (0, swagger_1.ApiTags)('Base de Conocimiento'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('agentes/:agenteId/base-conocimiento'),
    __metadata("design:paramtypes", [base_conocimiento_service_1.BaseConocimientoService,
        agente_service_1.AgenteService])
], BaseConocimientoController);
exports.BaseConocimientoController = BaseConocimientoController;
//# sourceMappingURL=base-conocimiento.controller.js.map