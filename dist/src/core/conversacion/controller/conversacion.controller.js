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
exports.ConversacionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const conversacion_service_1 = require("../service/conversacion.service");
const calificacion_service_1 = require("../service/calificacion.service");
const create_conversacion_dto_1 = require("../dto/create-conversacion.dto");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
let ConversacionController = class ConversacionController {
    constructor(conversacionService, calificacionService) {
        this.conversacionService = conversacionService;
        this.calificacionService = calificacionService;
    }
    async listar(agenteId, req) {
        const datos = await this.conversacionService.listar(req.user.clienteId, agenteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async estadisticas(agenteId, req) {
        const datos = await this.conversacionService.estadisticas(req.user.clienteId, agenteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async obtenerConfigCalificacion(req) {
        const datos = await this.calificacionService.obtenerConfig(req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async guardarConfigCalificacion(body, req) {
        await this.calificacionService.guardarConfig(req.user.clienteId, body, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(null, 'Configuración guardada');
    }
    async calificarLote(req) {
        const datos = await this.calificacionService.calificarLote(req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos, `Calificadas: ${datos.calificadas}, errores: ${datos.errores}`);
    }
    async obtener(id) {
        const datos = await this.conversacionService.obtener(id);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crear(dto, req) {
        const datos = await this.conversacionService.crear(dto, req.user.id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Conversación creada');
    }
    async agregarMensaje(id, dto) {
        const datos = await this.conversacionService.agregarMensaje(id, dto);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async calificarConIA(id, req) {
        const datos = await this.calificacionService.calificarConIA(id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos, `Score asignado: ${datos.score}`);
    }
    async actualizarScore(id, score) {
        await this.conversacionService.actualizarScore(id, score);
        return new success_response_dto_1.SuccessResponseDto(null, 'Score actualizado');
    }
    async actualizarEstado(id, estadoConversacion) {
        await this.conversacionService.actualizarEstado(id, estadoConversacion);
        return new success_response_dto_1.SuccessResponseDto(null, 'Estado actualizado');
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('agenteId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversacionController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('estadisticas'),
    __param(0, (0, common_1.Query)('agenteId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversacionController.prototype, "estadisticas", null);
__decorate([
    (0, common_1.Get)('calificacion-config'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConversacionController.prototype, "obtenerConfigCalificacion", null);
__decorate([
    (0, common_1.Put)('calificacion-config'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ConversacionController.prototype, "guardarConfigCalificacion", null);
__decorate([
    (0, common_1.Post)('calificar-lote'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConversacionController.prototype, "calificarLote", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConversacionController.prototype, "obtener", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_conversacion_dto_1.CreateConversacionDto, Object]),
    __metadata("design:returntype", Promise)
], ConversacionController.prototype, "crear", null);
__decorate([
    (0, common_1.Post)(':id/mensajes'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_conversacion_dto_1.AgregarMensajeDto]),
    __metadata("design:returntype", Promise)
], ConversacionController.prototype, "agregarMensaje", null);
__decorate([
    (0, common_1.Post)(':id/calificar'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversacionController.prototype, "calificarConIA", null);
__decorate([
    (0, common_1.Patch)(':id/score'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('score')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ConversacionController.prototype, "actualizarScore", null);
__decorate([
    (0, common_1.Patch)(':id/estado'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('estadoConversacion')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ConversacionController.prototype, "actualizarEstado", null);
ConversacionController = __decorate([
    (0, swagger_1.ApiTags)('Conversaciones'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('conversaciones'),
    __metadata("design:paramtypes", [conversacion_service_1.ConversacionService,
        calificacion_service_1.CalificacionService])
], ConversacionController);
exports.ConversacionController = ConversacionController;
//# sourceMappingURL=conversacion.controller.js.map