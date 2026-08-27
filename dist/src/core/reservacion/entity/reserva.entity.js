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
exports.Reserva = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
const constants_1 = require("../../../common/constants");
let Reserva = class Reserva extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], Reserva.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'codigo_reserva', length: 30, unique: true }),
    __metadata("design:type", String)
], Reserva.prototype, "codigoReserva", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'agente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Reserva.prototype, "agenteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_agente_reserva', length: 10 }),
    __metadata("design:type", String)
], Reserva.prototype, "tipoAgenteReserva", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'servicio_agente_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], Reserva.prototype, "servicioAgenteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Reserva.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conversacion_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], Reserva.prototype, "conversacionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contacto_nombre', length: 200 }),
    __metadata("design:type", String)
], Reserva.prototype, "contactoNombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contacto_telefono', length: 30, nullable: true }),
    __metadata("design:type", String)
], Reserva.prototype, "contactoTelefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contacto_email', length: 150, nullable: true }),
    __metadata("design:type", String)
], Reserva.prototype, "contactoEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_inicio', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Reserva.prototype, "fechaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_fin', type: 'timestamptz' }),
    __metadata("design:type", Date)
], Reserva.prototype, "fechaFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duracion_minutos', type: 'int' }),
    __metadata("design:type", Number)
], Reserva.prototype, "duracionMinutos", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'titulo', length: 200 }),
    __metadata("design:type", String)
], Reserva.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Reserva.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_servicio', length: 100, nullable: true }),
    __metadata("design:type", String)
], Reserva.prototype, "tipoServicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_reserva', length: 20, default: constants_1.EstadoReserva.CONFIRMADA }),
    __metadata("design:type", String)
], Reserva.prototype, "estadoReserva", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notas_internas', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Reserva.prototype, "notasInternas", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resultado', length: 30, nullable: true }),
    __metadata("design:type", String)
], Reserva.prototype, "resultado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recordatorio_enviado', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Reserva.prototype, "recordatorioEnviado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'google_event_id', type: 'varchar', length: 300, nullable: true }),
    __metadata("design:type", Object)
], Reserva.prototype, "googleEventId", void 0);
Reserva = __decorate([
    (0, typeorm_1.Entity)({ name: 'reserva', schema: process.env.DB_SCHEMA || 'public' }),
    (0, typeorm_1.Index)(['agenteId', 'fechaInicio']),
    __metadata("design:paramtypes", [Object])
], Reserva);
exports.Reserva = Reserva;
//# sourceMappingURL=reserva.entity.js.map