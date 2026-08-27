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
var GoogleCalendarService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const googleapis_1 = require("googleapis");
const SCOPES = ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/userinfo.email'];
let GoogleCalendarService = GoogleCalendarService_1 = class GoogleCalendarService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(GoogleCalendarService_1.name);
    }
    redirectUri() {
        const appUrl = (this.configService.get('APP_URL') || 'http://localhost:3001').replace(/\/$/, '');
        return `${appUrl}/google-calendar/oauth/callback`;
    }
    nuevoCliente() {
        return new googleapis_1.google.auth.OAuth2(this.configService.get('GOOGLE_CLIENT_ID'), this.configService.get('GOOGLE_CLIENT_SECRET'), this.redirectUri());
    }
    generarUrlAutorizacion(state) {
        const client = this.nuevoCliente();
        return client.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: SCOPES, state });
    }
    async intercambiarCodigo(code) {
        const client = this.nuevoCliente();
        const { tokens } = await client.getToken(code);
        return tokens;
    }
    async obtenerEmailCuenta(tokens) {
        const client = this.nuevoCliente();
        client.setCredentials(tokens);
        const oauth2 = googleapis_1.google.oauth2({ version: 'v2', auth: client });
        const { data } = await oauth2.userinfo.get();
        return data.email || undefined;
    }
    async revocarToken(accessToken) {
        const client = this.nuevoCliente();
        try {
            await client.revokeToken(accessToken);
        }
        catch (err) {
            this.logger.warn(`[GoogleCalendar] No se pudo revocar el token en Google (puede que ya estuviera revocado): ${err.message}`);
        }
    }
    clienteAutenticado(credenciales, onTokensRenovados) {
        const client = this.nuevoCliente();
        client.setCredentials({
            access_token: credenciales.accessToken,
            refresh_token: credenciales.refreshToken,
            expiry_date: credenciales.expiraEn ? credenciales.expiraEn.getTime() : undefined,
        });
        client.on('tokens', tokens => onTokensRenovados(tokens));
        return client;
    }
    async crearEvento(credenciales, evento, onTokensRenovados) {
        const client = this.clienteAutenticado(credenciales, onTokensRenovados);
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth: client });
        const { data } = await calendar.events.insert({
            calendarId: credenciales.calendarId,
            requestBody: {
                summary: evento.titulo,
                description: evento.descripcion,
                start: { dateTime: evento.fechaInicio.toISOString() },
                end: { dateTime: evento.fechaFin.toISOString() },
                extendedProperties: { private: { origen: 'crm', reservaId: evento.reservaId } },
            },
        });
        return data.id || null;
    }
    async actualizarEvento(credenciales, googleEventId, evento, onTokensRenovados) {
        const client = this.clienteAutenticado(credenciales, onTokensRenovados);
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth: client });
        await calendar.events.patch({
            calendarId: credenciales.calendarId,
            eventId: googleEventId,
            requestBody: {
                summary: evento.titulo,
                description: evento.descripcion,
                start: { dateTime: evento.fechaInicio.toISOString() },
                end: { dateTime: evento.fechaFin.toISOString() },
            },
        });
    }
    async eliminarEvento(credenciales, googleEventId, onTokensRenovados) {
        const client = this.clienteAutenticado(credenciales, onTokensRenovados);
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth: client });
        try {
            await calendar.events.delete({ calendarId: credenciales.calendarId, eventId: googleEventId });
        }
        catch (err) {
            if (err.code !== 404 && err.code !== 410)
                throw err;
        }
    }
    async listarCambios(credenciales, onTokensRenovados) {
        const client = this.clienteAutenticado(credenciales, onTokensRenovados);
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth: client });
        try {
            const { data } = await calendar.events.list({
                calendarId: credenciales.calendarId,
                singleEvents: true,
                syncToken: credenciales.syncToken || undefined,
                timeMin: credenciales.syncToken ? undefined : new Date().toISOString(),
            });
            return { eventos: data.items || [], nextSyncToken: data.nextSyncToken, requiereSyncCompleta: false };
        }
        catch (err) {
            if (err.code === 410) {
                return { eventos: [], nextSyncToken: null, requiereSyncCompleta: true };
            }
            throw err;
        }
    }
};
GoogleCalendarService = GoogleCalendarService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GoogleCalendarService);
exports.GoogleCalendarService = GoogleCalendarService;
//# sourceMappingURL=google-calendar.service.js.map