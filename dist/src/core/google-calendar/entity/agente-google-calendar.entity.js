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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgenteGoogleCalendar = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let AgenteGoogleCalendar = class AgenteGoogleCalendar extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], AgenteGoogleCalendar.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ name: 'agente_id', type: 'bigint' }),
    __metadata("design:type", String)
], AgenteGoogleCalendar.prototype, "agenteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], AgenteGoogleCalendar.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'google_email', length: 200, nullable: true }),
    __metadata("design:type", String)
], AgenteGoogleCalendar.prototype, "googleEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'access_token', type: 'text' }),
    __metadata("design:type", String)
], AgenteGoogleCalendar.prototype, "accessToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'refresh_token', type: 'text' }),
    __metadata("design:type", String)
], AgenteGoogleCalendar.prototype, "refreshToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expira_en', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], AgenteGoogleCalendar.prototype, "expiraEn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'calendar_id', length: 200, default: 'primary' }),
    __metadata("design:type", String)
], AgenteGoogleCalendar.prototype, "calendarId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sync_token', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], AgenteGoogleCalendar.prototype, "syncToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activo', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], AgenteGoogleCalendar.prototype, "activo", void 0);
AgenteGoogleCalendar = __decorate([
    (0, typeorm_1.Entity)({ name: 'agente_google_calendar', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], AgenteGoogleCalendar);
exports.AgenteGoogleCalendar = AgenteGoogleCalendar;
//# sourceMappingURL=agente-google-calendar.entity.js.map