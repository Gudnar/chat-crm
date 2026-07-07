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
exports.SoporteController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const soporte_service_1 = require("../service/soporte.service");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
let SoporteController = class SoporteController {
    constructor(soporteService) {
        this.soporteService = soporteService;
    }
    async listar(req) {
        const datos = await this.soporteService.listar(req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async estadisticas(req) {
        const datos = await this.soporteService.estadisticas(req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async obtener(id, req) {
        const datos = await this.soporteService.obtener(id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crear(body, req) {
        const datos = await this.soporteService.crear(body.titulo, body.descripcion, body.nombreContacto, body.prioridad || 'media', body.categoria, req.user.clienteId, req.user.id, body.conversacionId, body.telefonoContacto, body.emailContacto);
        return new success_response_dto_1.SuccessResponseDto(datos, `Caso ${datos.numeroCaso} creado`);
    }
    async cambiarEstado(id, estadoCaso, req) {
        const datos = await this.soporteService.cambiarEstado(id, req.user.clienteId, estadoCaso, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Estado actualizado');
    }
    async actualizar(id, body, req) {
        const datos = await this.soporteService.actualizar(id, req.user.clienteId, {
            ...body,
            usuarioModificacion: req.user.id,
        });
        return new success_response_dto_1.SuccessResponseDto(datos, 'Caso actualizado');
    }
    async agregarNota(id, nota, req) {
        const datos = await this.soporteService.agregarNota(id, req.user.clienteId, nota, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Nota agregada');
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SoporteController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('estadisticas'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SoporteController.prototype, "estadisticas", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SoporteController.prototype, "obtener", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SoporteController.prototype, "crear", null);
__decorate([
    (0, common_1.Patch)(':id/estado'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('estadoCaso')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SoporteController.prototype, "cambiarEstado", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SoporteController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Post)(':id/notas'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('nota')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SoporteController.prototype, "agregarNota", null);
SoporteController = __decorate([
    (0, swagger_1.ApiTags)('Soporte'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('soporte'),
    __metadata("design:paramtypes", [soporte_service_1.SoporteService])
], SoporteController);
exports.SoporteController = SoporteController;
//# sourceMappingURL=soporte.controller.js.map