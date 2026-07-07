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
exports.CasoSoporte = void 0;
const typeorm_1 = require("typeorm");
const cliente_entity_1 = require("../../cliente/entity/cliente.entity");
const conversacion_entity_1 = require("../../conversacion/entity/conversacion.entity");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let CasoSoporte = class CasoSoporte extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super();
        Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], CasoSoporte.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'numero_caso', length: 50, unique: true }),
    __metadata("design:type", String)
], CasoSoporte.prototype, "numeroCaso", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'titulo', length: 500 }),
    __metadata("design:type", String)
], CasoSoporte.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion', type: 'text' }),
    __metadata("design:type", String)
], CasoSoporte.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado', length: 50, default: 'abierto' }),
    __metadata("design:type", String)
], CasoSoporte.prototype, "estadoCaso", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prioridad', length: 50, default: 'media' }),
    __metadata("design:type", String)
], CasoSoporte.prototype, "prioridad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'categoria', length: 100, nullable: true }),
    __metadata("design:type", String)
], CasoSoporte.prototype, "categoria", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conversacion_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], CasoSoporte.prototype, "conversacionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => conversacion_entity_1.Conversacion),
    (0, typeorm_1.JoinColumn)({ name: 'conversacion_id' }),
    __metadata("design:type", conversacion_entity_1.Conversacion)
], CasoSoporte.prototype, "conversacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], CasoSoporte.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cliente_entity_1.Cliente),
    (0, typeorm_1.JoinColumn)({ name: 'cliente_id' }),
    __metadata("design:type", cliente_entity_1.Cliente)
], CasoSoporte.prototype, "cliente", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre_contacto', length: 200 }),
    __metadata("design:type", String)
], CasoSoporte.prototype, "nombreContacto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email_contacto', length: 150, nullable: true }),
    __metadata("design:type", String)
], CasoSoporte.prototype, "emailContacto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'telefono_contacto', length: 50, nullable: true }),
    __metadata("design:type", String)
], CasoSoporte.prototype, "telefonoContacto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'asignado_a', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], CasoSoporte.prototype, "asignadoA", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'historial', type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], CasoSoporte.prototype, "historial", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_resolucion', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], CasoSoporte.prototype, "fechaResolucion", void 0);
CasoSoporte = __decorate([
    (0, typeorm_1.Entity)({ name: 'caso_soporte', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], CasoSoporte);
exports.CasoSoporte = CasoSoporte;
//# sourceMappingURL=caso.entity.js.map