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
exports.HerramientaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const herramienta_service_1 = require("../service/herramienta.service");
const agente_service_1 = require("../../agente/service/agente.service");
const create_herramienta_dto_1 = require("../dto/create-herramienta.dto");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
const response_messages_1 = require("../../../common/constants/response-messages");
let HerramientaController = class HerramientaController {
    constructor(herramientaService, agenteService) {
        this.herramientaService = herramientaService;
        this.agenteService = agenteService;
    }
    async listar(agenteId, req) {
        await this.agenteService.obtener(agenteId, req.user.clienteId);
        const datos = await this.herramientaService.listarPorAgente(agenteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crear(dto, req) {
        await this.agenteService.obtener(dto.agenteId, req.user.clienteId);
        const datos = await this.herramientaService.crear(dto, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, response_messages_1.Messages.SUCCESS_CREATE);
    }
    async crearDefaults(agenteId, req) {
        await this.agenteService.obtener(agenteId, req.user.clienteId);
        const existentes = await this.herramientaService.listarPorAgente(agenteId);
        if (existentes.length > 0) {
            return new success_response_dto_1.SuccessResponseDto(existentes, 'El agente ya tiene herramientas configuradas');
        }
        await this.herramientaService.crearHerramientasPorDefecto(agenteId, req.user.id);
        const datos = await this.herramientaService.listarPorAgente(agenteId);
        return new success_response_dto_1.SuccessResponseDto(datos, `${datos.length} herramientas creadas para el agente`);
    }
    async actualizar(id, dto, req) {
        const h = await this.herramientaService.obtener(id);
        await this.agenteService.obtener(h.agenteId, req.user.clienteId);
        const datos = await this.herramientaService.actualizar(id, dto, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, response_messages_1.Messages.SUCCESS_UPDATE);
    }
    async eliminar(id, req) {
        const h = await this.herramientaService.obtener(id);
        await this.agenteService.obtener(h.agenteId, req.user.clienteId);
        await this.herramientaService.eliminar(id, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(null, response_messages_1.Messages.SUCCESS_DELETE);
    }
};
__decorate([
    (0, common_1.Get)('agente/:agenteId'),
    __param(0, (0, common_1.Param)('agenteId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HerramientaController.prototype, "listar", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_herramienta_dto_1.CreateHerramientaDto, Object]),
    __metadata("design:returntype", Promise)
], HerramientaController.prototype, "crear", null);
__decorate([
    (0, common_1.Post)('defaults/:agenteId'),
    __param(0, (0, common_1.Param)('agenteId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HerramientaController.prototype, "crearDefaults", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_herramienta_dto_1.UpdateHerramientaDto, Object]),
    __metadata("design:returntype", Promise)
], HerramientaController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HerramientaController.prototype, "eliminar", null);
HerramientaController = __decorate([
    (0, swagger_1.ApiTags)('Herramientas'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('herramientas'),
    __metadata("design:paramtypes", [herramienta_service_1.HerramientaService,
        agente_service_1.AgenteService])
], HerramientaController);
exports.HerramientaController = HerramientaController;
//# sourceMappingURL=herramienta.controller.js.map