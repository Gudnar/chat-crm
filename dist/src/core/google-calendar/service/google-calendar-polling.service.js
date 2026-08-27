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
var GoogleCalendarPollingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarPollingService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const google_calendar_service_1 = require("./google-calendar.service");
const agente_google_calendar_service_1 = require("./agente-google-calendar.service");
const excepcion_horario_agente_service_1 = require("../../reservacion/service/excepcion-horario-agente.service");
const fecha_bolivia_util_1 = require("../../../common/lib/fecha-bolivia.util");
const constants_1 = require("../../../common/constants");
let GoogleCalendarPollingService = GoogleCalendarPollingService_1 = class GoogleCalendarPollingService {
    constructor(googleCalendarService, agenteGoogleCalendarService, excepcionHorarioAgenteService) {
        this.googleCalendarService = googleCalendarService;
        this.agenteGoogleCalendarService = agenteGoogleCalendarService;
        this.excepcionHorarioAgenteService = excepcionHorarioAgenteService;
        this.logger = new common_1.Logger(GoogleCalendarPollingService_1.name);
    }
    async cronSincronizacion() {
        const conexiones = await this.agenteGoogleCalendarService.listarActivas();
        for (const conexion of conexiones) {
            await this.sincronizarConexion(conexion).catch(e => this.logger.warn(`[GoogleCalendarPolling] agente ${conexion.agenteId}: ${e.message}`));
        }
    }
    async sincronizarConexion(conexion) {
        const resultado = await this.googleCalendarService.listarCambios(conexion, tokens => this.persistirTokensRenovados(conexion.id, tokens));
        if (resultado.requiereSyncCompleta) {
            await this.agenteGoogleCalendarService.actualizarSyncToken(conexion.id, null);
            this.logger.log(`[GoogleCalendarPolling] syncToken inválido para agente ${conexion.agenteId} — se forzará sync completa en la próxima corrida`);
            return;
        }
        for (const evento of resultado.eventos) {
            if (!evento.id)
                continue;
            if (evento.extendedProperties?.private?.origen === 'crm')
                continue;
            if (evento.status === 'cancelled') {
                await this.excepcionHorarioAgenteService.eliminarPorGoogleEventId(conexion.agenteId, conexion.clienteId, evento.id, constants_1.USUARIO_SISTEMA);
                continue;
            }
            const inicio = evento.start?.dateTime || evento.start?.date;
            const fin = evento.end?.dateTime || evento.end?.date;
            if (!inicio || !fin)
                continue;
            const { fecha, hora: horaInicio } = (0, fecha_bolivia_util_1.utcAFechaHoraBolivia)(new Date(inicio));
            const { hora: horaFin } = (0, fecha_bolivia_util_1.utcAFechaHoraBolivia)(new Date(fin));
            await this.excepcionHorarioAgenteService.upsertDesdeGoogle({
                agenteId: conexion.agenteId,
                clienteId: conexion.clienteId,
                fecha,
                horaInicio,
                horaFin,
                motivo: evento.summary || 'Evento de Google Calendar',
                googleEventId: evento.id,
                usuarioSistema: constants_1.USUARIO_SISTEMA,
            });
        }
        await this.agenteGoogleCalendarService.actualizarSyncToken(conexion.id, resultado.nextSyncToken || null);
    }
    persistirTokensRenovados(agenteGoogleCalendarId, tokens) {
        this.agenteGoogleCalendarService.actualizarTokens(agenteGoogleCalendarId, tokens).catch(e => this.logger.warn(`[GoogleCalendarPolling] No se pudieron persistir los tokens renovados: ${e.message}`));
    }
};
__decorate([
    (0, schedule_1.Cron)('*/15 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GoogleCalendarPollingService.prototype, "cronSincronizacion", null);
GoogleCalendarPollingService = GoogleCalendarPollingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [google_calendar_service_1.GoogleCalendarService,
        agente_google_calendar_service_1.AgenteGoogleCalendarService,
        excepcion_horario_agente_service_1.ExcepcionHorarioAgenteService])
], GoogleCalendarPollingService);
exports.GoogleCalendarPollingService = GoogleCalendarPollingService;
//# sourceMappingURL=google-calendar-polling.service.js.map