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
exports.HorarioAgente = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let HorarioAgente = class HorarioAgente extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], HorarioAgente.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'agente_id', type: 'bigint' }),
    __metadata("design:type", String)
], HorarioAgente.prototype, "agenteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], HorarioAgente.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dia_semana', type: 'int' }),
    __metadata("design:type", Number)
], HorarioAgente.prototype, "diaSemana", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hora_inicio', length: 5 }),
    __metadata("design:type", String)
], HorarioAgente.prototype, "horaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hora_fin', length: 5 }),
    __metadata("design:type", String)
], HorarioAgente.prototype, "horaFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activo', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], HorarioAgente.prototype, "activo", void 0);
HorarioAgente = __decorate([
    (0, typeorm_1.Entity)({ name: 'horario_agente', schema: process.env.DB_SCHEMA || 'public' }),
    (0, typeorm_1.Index)(['agenteId', 'diaSemana']),
    __metadata("design:paramtypes", [Object])
], HorarioAgente);
exports.HorarioAgente = HorarioAgente;
//# sourceMappingURL=horario-agente.entity.js.map