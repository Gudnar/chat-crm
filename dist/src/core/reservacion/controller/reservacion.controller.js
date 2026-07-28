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
exports.ReservacionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const reservacion_service_1 = require("../service/reservacion.service");
const reserva_dto_1 = require("../dto/reserva.dto");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
const constants_1 = require("../../../common/constants");
const agente_humano_service_1 = require("../../agente-humano/service/agente-humano.service");
let ReservacionController = class ReservacionController {
    constructor(reservacionService, agenteHumanoService) {
        this.reservacionService = reservacionService;
        this.agenteHumanoService = agenteHumanoService;
    }
    async obtenerDisponibilidad(agenteId, fecha, duracionMinutos, req) {
        if (!agenteId || !fecha)
            throw new common_1.BadRequestException('agenteId y fecha son obligatorios');
        const datos = await this.reservacionService.obtenerDisponibilidad(agenteId, this.clienteIdDe(req), fecha, Number(duracionMinutos) || 30);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async listarMias(req) {
        const propio = await this.agenteHumanoService.obtenerPorUsuarioId(req.user.id);
        if (!propio)
            throw new common_1.BadRequestException('No tienes un agente humano asociado a tu usuario');
        const datos = await this.reservacionService.listar(this.clienteIdDe(req), { agenteId: propio.id });
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async listar(agenteId, estado, desde, hasta, req) {
        const datos = await this.reservacionService.listar(this.clienteIdDe(req), { agenteId, estado, desde, hasta });
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async obtener(id, req) {
        const datos = await this.reservacionService.obtener(id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crear(dto, req) {
        const datos = await this.reservacionService.crear(dto, req.user.id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos, `Reserva ${datos.codigoReserva} creada`);
    }
    async actualizar(id, dto, req) {
        const datos = await this.reservacionService.actualizar(id, dto, req.user.id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos, 'Reserva actualizada');
    }
    async actualizarEstado(id, dto, req) {
        const datos = await this.reservacionService.actualizarEstado(id, dto, req.user.id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos, 'Estado de la reserva actualizado');
    }
    async cancelar(id, req) {
        const datos = await this.reservacionService.actualizarEstado(id, { estado: constants_1.EstadoReserva.CANCELADA }, req.user.id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos, 'Reserva cancelada');
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
    (0, common_1.Get)('disponibilidad'),
    __param(0, (0, common_1.Query)('agenteId')),
    __param(1, (0, common_1.Query)('fecha')),
    __param(2, (0, common_1.Query)('duracionMinutos')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ReservacionController.prototype, "obtenerDisponibilidad", null);
__decorate([
    (0, common_1.Get)('mias'),
    (0, roles_decorator_1.Roles)('AGENTE_HUMANO'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReservacionController.prototype, "listarMias", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE', 'COLABORADOR'),
    __param(0, (0, common_1.Query)('agenteId')),
    __param(1, (0, common_1.Query)('estado')),
    __param(2, (0, common_1.Query)('desde')),
    __param(3, (0, common_1.Query)('hasta')),
    __param(4, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ReservacionController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReservacionController.prototype, "obtener", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reserva_dto_1.CreateReservaDto, Object]),
    __metadata("design:returntype", Promise)
], ReservacionController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reserva_dto_1.UpdateReservaDto, Object]),
    __metadata("design:returntype", Promise)
], ReservacionController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Put)(':id/estado'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reserva_dto_1.ActualizarEstadoReservaDto, Object]),
    __metadata("design:returntype", Promise)
], ReservacionController.prototype, "actualizarEstado", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReservacionController.prototype, "cancelar", null);
ReservacionController = __decorate([
    (0, swagger_1.ApiTags)('Reservaciones'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('reservaciones'),
    __metadata("design:paramtypes", [reservacion_service_1.ReservacionService,
        agente_humano_service_1.AgenteHumanoService])
], ReservacionController);
exports.ReservacionController = ReservacionController;
//# sourceMappingURL=reservacion.controller.js.map