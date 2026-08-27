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
var GoogleCalendarSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarSyncService = void 0;
const common_1 = require("@nestjs/common");
const google_calendar_service_1 = require("./google-calendar.service");
const agente_google_calendar_service_1 = require("./agente-google-calendar.service");
let GoogleCalendarSyncService = GoogleCalendarSyncService_1 = class GoogleCalendarSyncService {
    constructor(googleCalendarService, agenteGoogleCalendarService) {
        this.googleCalendarService = googleCalendarService;
        this.agenteGoogleCalendarService = agenteGoogleCalendarService;
        this.logger = new common_1.Logger(GoogleCalendarSyncService_1.name);
    }
    async sincronizarCreacion(reserva) {
        const conexion = await this.agenteGoogleCalendarService.obtenerPorAgente(reserva.agenteId, reserva.clienteId);
        if (!conexion)
            return null;
        try {
            return await this.googleCalendarService.crearEvento(conexion, { titulo: reserva.titulo, descripcion: reserva.descripcion, fechaInicio: reserva.fechaInicio, fechaFin: reserva.fechaFin, reservaId: reserva.id }, tokens => this.persistirTokensRenovados(conexion.id, tokens));
        }
        catch (err) {
            this.logger.warn(`[GoogleCalendarSync] No se pudo crear el evento para la reserva ${reserva.id}: ${err.message}`);
            return null;
        }
    }
    async sincronizarActualizacion(reserva) {
        if (!reserva.googleEventId)
            return;
        const conexion = await this.agenteGoogleCalendarService.obtenerPorAgente(reserva.agenteId, reserva.clienteId);
        if (!conexion)
            return;
        try {
            await this.googleCalendarService.actualizarEvento(conexion, reserva.googleEventId, { titulo: reserva.titulo, descripcion: reserva.descripcion, fechaInicio: reserva.fechaInicio, fechaFin: reserva.fechaFin, reservaId: reserva.id }, tokens => this.persistirTokensRenovados(conexion.id, tokens));
        }
        catch (err) {
            this.logger.warn(`[GoogleCalendarSync] No se pudo actualizar el evento de la reserva ${reserva.id}: ${err.message}`);
        }
    }
    async sincronizarCancelacion(reserva) {
        if (!reserva.googleEventId)
            return;
        const conexion = await this.agenteGoogleCalendarService.obtenerPorAgente(reserva.agenteId, reserva.clienteId);
        if (!conexion)
            return;
        try {
            await this.googleCalendarService.eliminarEvento(conexion, reserva.googleEventId, tokens => this.persistirTokensRenovados(conexion.id, tokens));
        }
        catch (err) {
            this.logger.warn(`[GoogleCalendarSync] No se pudo eliminar el evento de la reserva ${reserva.id}: ${err.message}`);
        }
    }
    persistirTokensRenovados(agenteGoogleCalendarId, tokens) {
        this.agenteGoogleCalendarService.actualizarTokens(agenteGoogleCalendarId, tokens).catch(e => this.logger.warn(`[GoogleCalendarSync] No se pudieron persistir los tokens renovados: ${e.message}`));
    }
};
GoogleCalendarSyncService = GoogleCalendarSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [google_calendar_service_1.GoogleCalendarService,
        agente_google_calendar_service_1.AgenteGoogleCalendarService])
], GoogleCalendarSyncService);
exports.GoogleCalendarSyncService = GoogleCalendarSyncService;
//# sourceMappingURL=google-calendar-sync.service.js.map