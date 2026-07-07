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
exports.Conversacion = void 0;
const typeorm_1 = require("typeorm");
const cliente_entity_1 = require("../../cliente/entity/cliente.entity");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let Conversacion = class Conversacion extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], Conversacion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'agente_id', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], Conversacion.prototype, "agenteId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'agente_humano_id', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], Conversacion.prototype, "agenteHumanoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_agente_asignado', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], Conversacion.prototype, "tipoAgenteAsignado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_asignacion_humano', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Conversacion.prototype, "fechaAsignacionHumano", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contacto', length: 200 }),
    __metadata("design:type", String)
], Conversacion.prototype, "contacto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'canal', length: 30, default: 'chat' }),
    __metadata("design:type", String)
], Conversacion.prototype, "canal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_conversacion', length: 30, default: 'abierto' }),
    __metadata("design:type", String)
], Conversacion.prototype, "estadoConversacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'score', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Conversacion.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mensajes', type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], Conversacion.prototype, "mensajes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_mensajes', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Conversacion.prototype, "totalMensajes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'escalado', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Conversacion.prototype, "escalado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'etiquetas', type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], Conversacion.prototype, "etiquetas", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motivo_score', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Conversacion.prototype, "motivoScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ultima_calificacion', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Conversacion.prototype, "ultimaCalificacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notas', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Conversacion.prototype, "notas", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resolucion', length: 500, nullable: true }),
    __metadata("design:type", String)
], Conversacion.prototype, "resolucion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Conversacion.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cliente_entity_1.Cliente),
    (0, typeorm_1.JoinColumn)({ name: 'cliente_id' }),
    __metadata("design:type", cliente_entity_1.Cliente)
], Conversacion.prototype, "cliente", void 0);
Conversacion = __decorate([
    (0, typeorm_1.Entity)({ name: 'conversacion', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], Conversacion);
exports.Conversacion = Conversacion;
//# sourceMappingURL=conversacion.entity.js.map