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
exports.GoogleCalendarController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const agente_humano_service_1 = require("../../agente-humano/service/agente-humano.service");
const google_calendar_service_1 = require("../service/google-calendar.service");
const agente_google_calendar_service_1 = require("../service/agente-google-calendar.service");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
const constants_1 = require("../../../common/constants");
let GoogleCalendarController = class GoogleCalendarController {
    constructor(googleCalendarService, agenteGoogleCalendarService, agenteHumanoService, jwtService, configService) {
        this.googleCalendarService = googleCalendarService;
        this.agenteGoogleCalendarService = agenteGoogleCalendarService;
        this.agenteHumanoService = agenteHumanoService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async conectar(req) {
        const agente = await this.agenteHumanoService.obtenerPorUsuarioId(req.user.id);
        if (!agente)
            throw new common_1.BadRequestException('No tienes un agente humano asociado a tu usuario');
        const state = this.jwtService.sign({ agenteId: agente.id, clienteId: agente.clienteId }, { expiresIn: '10m' });
        const url = this.googleCalendarService.generarUrlAutorizacion(state);
        return new success_response_dto_1.SuccessResponseDto({ url });
    }
    async callback(code, state, error, res) {
        const frontendUrl = (this.configService.get('FRONTEND_URL') || 'http://localhost:8083').replace(/\/$/, '');
        if (error || !code || !state) {
            res.redirect(`${frontendUrl}/admin/mis-citas?google=error`);
            return;
        }
        let datos;
        try {
            datos = this.jwtService.verify(state);
        }
        catch {
            res.redirect(`${frontendUrl}/admin/mis-citas?google=error`);
            return;
        }
        try {
            const tokens = await this.googleCalendarService.intercambiarCodigo(code);
            const email = await this.googleCalendarService.obtenerEmailCuenta(tokens);
            await this.agenteGoogleCalendarService.guardarConexion(datos.agenteId, datos.clienteId, tokens, email, constants_1.USUARIO_SISTEMA);
            res.redirect(`${frontendUrl}/admin/mis-citas?google=conectado`);
        }
        catch (err) {
            res.redirect(`${frontendUrl}/admin/mis-citas?google=error`);
        }
    }
    async estado(req) {
        const agente = await this.agenteHumanoService.obtenerPorUsuarioId(req.user.id);
        if (!agente)
            throw new common_1.BadRequestException('No tienes un agente humano asociado a tu usuario');
        const conexion = await this.agenteGoogleCalendarService.obtenerPorAgente(agente.id, agente.clienteId);
        return new success_response_dto_1.SuccessResponseDto({ conectado: !!conexion, email: conexion?.googleEmail });
    }
    async desconectar(req) {
        const agente = await this.agenteHumanoService.obtenerPorUsuarioId(req.user.id);
        if (!agente)
            throw new common_1.BadRequestException('No tienes un agente humano asociado a tu usuario');
        const conexion = await this.agenteGoogleCalendarService.obtenerPorAgente(agente.id, agente.clienteId);
        if (conexion)
            await this.googleCalendarService.revocarToken(conexion.accessToken);
        await this.agenteGoogleCalendarService.desconectar(agente.id, agente.clienteId, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(null, 'Google Calendar desconectado');
    }
};
__decorate([
    (0, common_1.Get)('conectar'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('AGENTE_HUMANO'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GoogleCalendarController.prototype, "conectar", null);
__decorate([
    (0, common_1.Get)('oauth/callback'),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('state')),
    __param(2, (0, common_1.Query)('error')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], GoogleCalendarController.prototype, "callback", null);
__decorate([
    (0, common_1.Get)('estado'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('AGENTE_HUMANO'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GoogleCalendarController.prototype, "estado", null);
__decorate([
    (0, common_1.Delete)('conectar'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('AGENTE_HUMANO'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GoogleCalendarController.prototype, "desconectar", null);
GoogleCalendarController = __decorate([
    (0, swagger_1.ApiTags)('Google Calendar'),
    (0, common_1.Controller)('google-calendar'),
    __metadata("design:paramtypes", [google_calendar_service_1.GoogleCalendarService,
        agente_google_calendar_service_1.AgenteGoogleCalendarService,
        agente_humano_service_1.AgenteHumanoService,
        jwt_1.JwtService,
        config_1.ConfigService])
], GoogleCalendarController);
exports.GoogleCalendarController = GoogleCalendarController;
//# sourceMappingURL=google-calendar.controller.js.map