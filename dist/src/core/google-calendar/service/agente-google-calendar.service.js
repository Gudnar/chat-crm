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
var AgenteGoogleCalendarService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgenteGoogleCalendarService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agente_google_calendar_entity_1 = require("../entity/agente-google-calendar.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
let AgenteGoogleCalendarService = AgenteGoogleCalendarService_1 = class AgenteGoogleCalendarService extends base_service_1.BaseService {
    constructor(repo) {
        super(AgenteGoogleCalendarService_1.name);
        this.repo = repo;
    }
    async obtenerPorAgente(agenteId, clienteId) {
        return this.repo.findOne({ where: { agenteId, clienteId, estado: constants_1.Status.ACTIVE, activo: true } });
    }
    async listarActivas() {
        return this.repo.find({ where: { estado: constants_1.Status.ACTIVE, activo: true } });
    }
    async guardarConexion(agenteId, clienteId, tokens, googleEmail, usuarioCreacion) {
        if (!tokens.access_token || !tokens.refresh_token) {
            throw new Error('Google no devolvió refresh_token — probablemente falta access_type=offline+prompt=consent, o el usuario ya había autorizado antes sin revocar');
        }
        const expiraEn = tokens.expiry_date ? new Date(tokens.expiry_date) : undefined;
        const existente = await this.repo.findOne({ where: { agenteId, clienteId } });
        if (existente) {
            Object.assign(existente, {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiraEn,
                googleEmail,
                activo: true,
                syncToken: null,
                estado: constants_1.Status.ACTIVE,
                transaccion: constants_1.Transacccion.ACTUALIZAR,
                usuarioModificacion: usuarioCreacion,
            });
            return this.repo.save(existente);
        }
        const nueva = this.repo.create({
            agenteId,
            clienteId,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiraEn,
            googleEmail,
            activo: true,
            calendarId: 'primary',
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.repo.save(nueva);
    }
    async actualizarTokens(id, tokens) {
        const fila = await this.repo.findOne({ where: { id } });
        if (!fila)
            return;
        if (tokens.access_token)
            fila.accessToken = tokens.access_token;
        if (tokens.refresh_token)
            fila.refreshToken = tokens.refresh_token;
        if (tokens.expiry_date)
            fila.expiraEn = new Date(tokens.expiry_date);
        await this.repo.save(fila);
    }
    async actualizarSyncToken(id, syncToken) {
        await this.repo.update({ id }, { syncToken });
    }
    async desconectar(agenteId, clienteId, usuarioModificacion) {
        const existente = await this.obtenerPorAgente(agenteId, clienteId);
        if (!existente)
            return null;
        existente.estado = constants_1.Status.ELIMINATE;
        existente.transaccion = constants_1.Transacccion.ELIMINAR;
        existente.usuarioModificacion = usuarioModificacion;
        await this.repo.save(existente);
        return existente;
    }
};
AgenteGoogleCalendarService = AgenteGoogleCalendarService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agente_google_calendar_entity_1.AgenteGoogleCalendar)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AgenteGoogleCalendarService);
exports.AgenteGoogleCalendarService = AgenteGoogleCalendarService;
//# sourceMappingURL=agente-google-calendar.service.js.map