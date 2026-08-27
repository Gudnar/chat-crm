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
exports.ExcepcionHorarioAgente = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let ExcepcionHorarioAgente = class ExcepcionHorarioAgente extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], ExcepcionHorarioAgente.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'agente_id', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], ExcepcionHorarioAgente.prototype, "agenteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], ExcepcionHorarioAgente.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_inicio', type: 'date' }),
    __metadata("design:type", String)
], ExcepcionHorarioAgente.prototype, "fechaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_fin', type: 'date' }),
    __metadata("design:type", String)
], ExcepcionHorarioAgente.prototype, "fechaFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motivo', length: 200 }),
    __metadata("design:type", String)
], ExcepcionHorarioAgente.prototype, "motivo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo', length: 20, default: 'otro' }),
    __metadata("design:type", String)
], ExcepcionHorarioAgente.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hora_inicio', type: 'varchar', length: 5, nullable: true }),
    __metadata("design:type", Object)
], ExcepcionHorarioAgente.prototype, "horaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hora_fin', type: 'varchar', length: 5, nullable: true }),
    __metadata("design:type", Object)
], ExcepcionHorarioAgente.prototype, "horaFin", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'google_event_id', type: 'varchar', length: 300, nullable: true }),
    __metadata("design:type", Object)
], ExcepcionHorarioAgente.prototype, "googleEventId", void 0);
ExcepcionHorarioAgente = __decorate([
    (0, typeorm_1.Entity)({ name: 'excepcion_horario_agente', schema: process.env.DB_SCHEMA || 'public' }),
    (0, typeorm_1.Index)(['clienteId', 'fechaInicio', 'fechaFin']),
    __metadata("design:paramtypes", [Object])
], ExcepcionHorarioAgente);
exports.ExcepcionHorarioAgente = ExcepcionHorarioAgente;
//# sourceMappingURL=excepcion-horario-agente.entity.js.map