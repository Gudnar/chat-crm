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
exports.ExcepcionHorarioAgenteController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const excepcion_horario_agente_service_1 = require("../service/excepcion-horario-agente.service");
const excepcion_horario_agente_dto_1 = require("../dto/excepcion-horario-agente.dto");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
const agente_humano_service_1 = require("../../agente-humano/service/agente-humano.service");
let ExcepcionHorarioAgenteController = class ExcepcionHorarioAgenteController {
    constructor(excepcionService, agenteHumanoService) {
        this.excepcionService = excepcionService;
        this.agenteHumanoService = agenteHumanoService;
    }
    async listar(agenteId, req) {
        const datos = await this.excepcionService.listar(this.clienteIdDe(req), { agenteId });
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async listarEnRango(desde, hasta, agenteId, req) {
        if (!desde || !hasta)
            throw new common_1.BadRequestException('desde y hasta son obligatorios');
        const datos = await this.excepcionService.listarEnRango(this.clienteIdDe(req), desde, hasta, agenteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async listarMias(desde, hasta, req) {
        const propio = await this.agenteHumanoService.obtenerPorUsuarioId(req.user.id);
        if (!propio)
            throw new common_1.BadRequestException('No tienes un agente humano asociado a tu usuario');
        const clienteId = this.clienteIdDe(req);
        const hoy = new Date();
        const desdeDefault = desde || new Date(hoy.getFullYear(), hoy.getMonth() - 6, 1).toISOString().slice(0, 10);
        const hastaDefault = hasta || new Date(hoy.getFullYear(), hoy.getMonth() + 6, 0).toISOString().slice(0, 10);
        const datos = await this.excepcionService.listarEnRango(clienteId, desdeDefault, hastaDefault, propio.id);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crear(dto, req) {
        const datos = await this.excepcionService.crear(dto, req.user.id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos, 'Excepción de calendario creada');
    }
    async actualizar(id, dto, req) {
        const datos = await this.excepcionService.actualizar(id, dto, req.user.id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos, 'Excepción de calendario actualizada');
    }
    async eliminar(id, req) {
        await this.excepcionService.eliminar(id, req.user.id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(null, 'Excepción de calendario eliminada');
    }
    clienteIdDe(req) {
        const deSesion = req.user?.clienteId;
        if (deSesion)
            return String(deSesion);
        const deQuery = req.query?.clienteId;
        if (deQuery)
            return String(deQuery);
        throw new common_1.BadRequestException('Debes indicar el cliente a administrar (parametro clienteId)');
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('agenteId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExcepcionHorarioAgenteController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('rango'),
    __param(0, (0, common_1.Query)('desde')),
    __param(1, (0, common_1.Query)('hasta')),
    __param(2, (0, common_1.Query)('agenteId')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ExcepcionHorarioAgenteController.prototype, "listarEnRango", null);
__decorate([
    (0, common_1.Get)('mias'),
    (0, roles_decorator_1.Roles)('AGENTE_HUMANO'),
    __param(0, (0, common_1.Query)('desde')),
    __param(1, (0, common_1.Query)('hasta')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ExcepcionHorarioAgenteController.prototype, "listarMias", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [excepcion_horario_agente_dto_1.CreateExcepcionHorarioAgenteDto, Object]),
    __metadata("design:returntype", Promise)
], ExcepcionHorarioAgenteController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, excepcion_horario_agente_dto_1.UpdateExcepcionHorarioAgenteDto, Object]),
    __metadata("design:returntype", Promise)
], ExcepcionHorarioAgenteController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExcepcionHorarioAgenteController.prototype, "eliminar", null);
ExcepcionHorarioAgenteController = __decorate([
    (0, swagger_1.ApiTags)('Excepciones de Horario (feriados/ausencias)'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('excepciones-horario-agente'),
    __metadata("design:paramtypes", [excepcion_horario_agente_service_1.ExcepcionHorarioAgenteService,
        agente_humano_service_1.AgenteHumanoService])
], ExcepcionHorarioAgenteController);
exports.ExcepcionHorarioAgenteController = ExcepcionHorarioAgenteController;
//# sourceMappingURL=excepcion-horario-agente.controller.js.map