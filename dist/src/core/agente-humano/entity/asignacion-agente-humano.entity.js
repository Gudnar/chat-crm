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
exports.AsignacionAgenteHumano = void 0;
const typeorm_1 = require("typeorm");
const conversacion_entity_1 = require("../../conversacion/entity/conversacion.entity");
const agente_entity_1 = require("../../agente/entity/agente.entity");
const cliente_entity_1 = require("../../cliente/entity/cliente.entity");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let AsignacionAgenteHumano = class AsignacionAgenteHumano extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], AsignacionAgenteHumano.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'conversacion_id', type: 'bigint' }),
    __metadata("design:type", String)
], AsignacionAgenteHumano.prototype, "conversacionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => conversacion_entity_1.Conversacion),
    (0, typeorm_1.JoinColumn)({ name: 'conversacion_id' }),
    __metadata("design:type", conversacion_entity_1.Conversacion)
], AsignacionAgenteHumano.prototype, "conversacion", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'agente_humano_id', type: 'bigint' }),
    __metadata("design:type", String)
], AsignacionAgenteHumano.prototype, "agenteHumanoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => agente_entity_1.Agente),
    (0, typeorm_1.JoinColumn)({ name: 'agente_humano_id' }),
    __metadata("design:type", agente_entity_1.Agente)
], AsignacionAgenteHumano.prototype, "agenteHumano", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'asignado_por', type: 'bigint' }),
    __metadata("design:type", String)
], AsignacionAgenteHumano.prototype, "asignadoPor", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'fecha_asignacion', type: 'timestamptz', default: () => 'now()' }),
    __metadata("design:type", Date)
], AsignacionAgenteHumano.prototype, "fechaAsignacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_cierre', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], AsignacionAgenteHumano.prototype, "fechaCierre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'razon_asignacion', length: 500, nullable: true }),
    __metadata("design:type", String)
], AsignacionAgenteHumano.prototype, "razonAsignacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fue_escalada', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AsignacionAgenteHumano.prototype, "fueEscalada", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_asignacion', length: 20, default: 'activa' }),
    __metadata("design:type", String)
], AsignacionAgenteHumano.prototype, "estadoAsignacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tiempo_atencion_segundos', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], AsignacionAgenteHumano.prototype, "tiempoAtencionSegundos", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], AsignacionAgenteHumano.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cliente_entity_1.Cliente),
    (0, typeorm_1.JoinColumn)({ name: 'cliente_id' }),
    __metadata("design:type", cliente_entity_1.Cliente)
], AsignacionAgenteHumano.prototype, "cliente", void 0);
AsignacionAgenteHumano = __decorate([
    (0, typeorm_1.Entity)({ name: 'asignacion_agente_humano', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], AsignacionAgenteHumano);
exports.AsignacionAgenteHumano = AsignacionAgenteHumano;
//# sourceMappingURL=asignacion-agente-humano.entity.js.map