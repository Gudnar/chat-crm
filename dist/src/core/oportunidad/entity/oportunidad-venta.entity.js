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
exports.OportunidadVenta = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
const cliente_entity_1 = require("../../cliente/entity/cliente.entity");
const conversacion_entity_1 = require("../../conversacion/entity/conversacion.entity");
let OportunidadVenta = class OportunidadVenta extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], OportunidadVenta.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'numero_oportunidad', length: 50, unique: true }),
    __metadata("design:type", String)
], OportunidadVenta.prototype, "numeroOportunidad", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'estado_oportunidad', type: 'varchar', length: 50, default: 'prospecto' }),
    __metadata("design:type", String)
], OportunidadVenta.prototype, "estadoOportunidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prioridad', length: 20, default: 'media' }),
    __metadata("design:type", String)
], OportunidadVenta.prototype, "prioridad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monto_estimado', type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], OportunidadVenta.prototype, "montoEstimado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'moneda', length: 10, default: 'USD' }),
    __metadata("design:type", String)
], OportunidadVenta.prototype, "moneda", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contacto_nombre', length: 200 }),
    __metadata("design:type", String)
], OportunidadVenta.prototype, "contactoNombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contacto_telefono', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], OportunidadVenta.prototype, "contactoTelefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contacto_email', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", Object)
], OportunidadVenta.prototype, "contactoEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'empresa', type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", Object)
], OportunidadVenta.prototype, "empresa", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'origen', length: 30, default: 'otro' }),
    __metadata("design:type", String)
], OportunidadVenta.prototype, "origen", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'producto_interes', type: 'varchar', length: 300, nullable: true }),
    __metadata("design:type", Object)
], OportunidadVenta.prototype, "productoInteres", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'conversacion_id', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], OportunidadVenta.prototype, "conversacionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_primer_contacto', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], OportunidadVenta.prototype, "fechaPrimerContacto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => conversacion_entity_1.Conversacion),
    (0, typeorm_1.JoinColumn)({ name: 'conversacion_id' }),
    __metadata("design:type", conversacion_entity_1.Conversacion)
], OportunidadVenta.prototype, "conversacion", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'asignado_a', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], OportunidadVenta.prototype, "asignadoA", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'asignado_nombre', type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", Object)
], OportunidadVenta.prototype, "asignadoNombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'proxima_accion', type: 'varchar', length: 300, nullable: true }),
    __metadata("design:type", Object)
], OportunidadVenta.prototype, "proximaAccion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'proxima_accion_fecha', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], OportunidadVenta.prototype, "proximaAccionFecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motivo_cierre', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], OportunidadVenta.prototype, "motivoCierre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_cierre', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], OportunidadVenta.prototype, "fechaCierre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notas', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], OportunidadVenta.prototype, "notas", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'historial', type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], OportunidadVenta.prototype, "historial", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], OportunidadVenta.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cliente_entity_1.Cliente),
    (0, typeorm_1.JoinColumn)({ name: 'cliente_id' }),
    __metadata("design:type", cliente_entity_1.Cliente)
], OportunidadVenta.prototype, "cliente", void 0);
OportunidadVenta = __decorate([
    (0, typeorm_1.Entity)({ name: 'oportunidad_venta', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], OportunidadVenta);
exports.OportunidadVenta = OportunidadVenta;
//# sourceMappingURL=oportunidad-venta.entity.js.map