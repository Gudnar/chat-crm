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
exports.OportunidadController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const oportunidad_service_1 = require("../service/oportunidad.service");
const oportunidad_dto_1 = require("../dto/oportunidad.dto");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
const constants_1 = require("../../../common/constants");
let OportunidadController = class OportunidadController {
    constructor(oportunidadService) {
        this.oportunidadService = oportunidadService;
    }
    forzarAsignado(req, asignadoA) {
        return req.user?.rol === constants_1.Roles.AGENTE_HUMANO ? req.user.id : asignadoA;
    }
    async listar(q, estadoOportunidad, prioridad, asignadoA, pagina, limite, req) {
        const paginaNum = Math.max(1, parseInt(pagina, 10) || 1);
        const limiteNum = Math.min(100, Math.max(1, parseInt(limite, 10) || 25));
        const datos = await this.oportunidadService.listar(req.user.clienteId, { q, estadoOportunidad, prioridad, asignadoA: this.forzarAsignado(req, asignadoA) }, paginaNum, limiteNum);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async estadisticas(req) {
        const datos = await this.oportunidadService.estadisticas(req.user.clienteId, this.forzarAsignado(req));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async usuariosAsignables(req) {
        const datos = await this.oportunidadService.usuariosAsignables(req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async obtener(id, req) {
        const datos = await this.oportunidadService.obtener(id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crear(dto, req) {
        const datos = await this.oportunidadService.crear(dto, req.user.clienteId, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, `Oportunidad ${datos.numeroOportunidad} creada`);
    }
    async actualizar(id, dto, req) {
        const datos = await this.oportunidadService.actualizar(id, dto, req.user.clienteId, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Oportunidad actualizada');
    }
    async cambiarEstado(id, dto, req) {
        const datos = await this.oportunidadService.cambiarEstado(id, dto.estado, dto.motivo, req.user.clienteId, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Estado actualizado');
    }
    async asignar(id, dto, req) {
        const datos = await this.oportunidadService.asignar(id, dto.usuarioId, req.user.clienteId, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Oportunidad asignada');
    }
    async registrarSeguimiento(id, dto, req) {
        const datos = await this.oportunidadService.registrarSeguimiento(id, dto, req.user.clienteId, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Seguimiento registrado');
    }
    async eliminar(id, req) {
        await this.oportunidadService.eliminar(id, req.user.clienteId, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(null, 'Oportunidad eliminada');
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('estado')),
    __param(2, (0, common_1.Query)('prioridad')),
    __param(3, (0, common_1.Query)('asignadoA')),
    __param(4, (0, common_1.Query)('pagina')),
    __param(5, (0, common_1.Query)('limite')),
    __param(6, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], OportunidadController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('estadisticas'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OportunidadController.prototype, "estadisticas", null);
__decorate([
    (0, common_1.Get)('usuarios-asignables'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OportunidadController.prototype, "usuariosAsignables", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OportunidadController.prototype, "obtener", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [oportunidad_dto_1.CreateOportunidadDto, Object]),
    __metadata("design:returntype", Promise)
], OportunidadController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, oportunidad_dto_1.UpdateOportunidadDto, Object]),
    __metadata("design:returntype", Promise)
], OportunidadController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Patch)(':id/estado'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, oportunidad_dto_1.CambiarEstadoOportunidadDto, Object]),
    __metadata("design:returntype", Promise)
], OportunidadController.prototype, "cambiarEstado", null);
__decorate([
    (0, common_1.Patch)(':id/asignar'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, oportunidad_dto_1.AsignarOportunidadDto, Object]),
    __metadata("design:returntype", Promise)
], OportunidadController.prototype, "asignar", null);
__decorate([
    (0, common_1.Post)(':id/seguimiento'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, oportunidad_dto_1.RegistrarSeguimientoDto, Object]),
    __metadata("design:returntype", Promise)
], OportunidadController.prototype, "registrarSeguimiento", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OportunidadController.prototype, "eliminar", null);
OportunidadController = __decorate([
    (0, swagger_1.ApiTags)('Oportunidades'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('oportunidades'),
    __metadata("design:paramtypes", [oportunidad_service_1.OportunidadService])
], OportunidadController);
exports.OportunidadController = OportunidadController;
//# sourceMappingURL=oportunidad.controller.js.map