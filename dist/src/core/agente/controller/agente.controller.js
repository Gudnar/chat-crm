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
exports.AgenteController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const agente_service_1 = require("../service/agente.service");
const create_agente_dto_1 = require("../dto/create-agente.dto");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
const response_messages_1 = require("../../../common/constants/response-messages");
let AgenteController = class AgenteController {
    constructor(agenteService) {
        this.agenteService = agenteService;
    }
    async listar(req) {
        const datos = await this.agenteService.listar(req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async obtener(id, req) {
        const datos = await this.agenteService.obtener(id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crear(dto, req) {
        const datos = await this.agenteService.crear(dto, req.user.id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos, response_messages_1.Messages.AGENTE_CREATED);
    }
    async actualizar(id, dto, req) {
        const datos = await this.agenteService.actualizar(id, dto, req.user.id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos, response_messages_1.Messages.AGENTE_UPDATED);
    }
    async eliminar(id, req) {
        await this.agenteService.eliminar(id, req.user.id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(null, response_messages_1.Messages.SUCCESS_DELETE);
    }
    async testConAgente(id, mensaje, historial = [], req) {
        const datos = await this.agenteService.testConAgente(id, mensaje, historial, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgenteController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AgenteController.prototype, "obtener", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_agente_dto_1.CreateAgenteDto, Object]),
    __metadata("design:returntype", Promise)
], AgenteController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_agente_dto_1.UpdateAgenteDto, Object]),
    __metadata("design:returntype", Promise)
], AgenteController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AgenteController.prototype, "eliminar", null);
__decorate([
    (0, common_1.Post)(':id/test'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('mensaje')),
    __param(2, (0, common_1.Body)('historial')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array, Object]),
    __metadata("design:returntype", Promise)
], AgenteController.prototype, "testConAgente", null);
AgenteController = __decorate([
    (0, swagger_1.ApiTags)('Agentes IA'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('agentes'),
    __metadata("design:paramtypes", [agente_service_1.AgenteService])
], AgenteController);
exports.AgenteController = AgenteController;
//# sourceMappingURL=agente.controller.js.map