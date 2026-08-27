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
exports.Pedido = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let Pedido = class Pedido extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], Pedido.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Pedido.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sucursal_id', type: 'bigint' }),
    __metadata("design:type", String)
], Pedido.prototype, "sucursalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_final_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], Pedido.prototype, "clienteFinalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conversacion_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], Pedido.prototype, "conversacionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contacto_telefono', length: 20 }),
    __metadata("design:type", String)
], Pedido.prototype, "contactoTelefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'codigo_pedido', length: 50 }),
    __metadata("design:type", String)
], Pedido.prototype, "codigoPedido", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'items', type: 'jsonb' }),
    __metadata("design:type", Array)
], Pedido.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'subtotal', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Pedido.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descuento', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Pedido.prototype, "descuento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Pedido.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_entrega', length: 20, default: 'recojo' }),
    __metadata("design:type", String)
], Pedido.prototype, "tipoEntrega", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'direccion_entrega', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Pedido.prototype, "direccionEntrega", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_pedido', length: 50, default: 'pendiente_confirmacion' }),
    __metadata("design:type", String)
], Pedido.prototype, "estadoPedido", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_pago', length: 20, default: 'pendiente' }),
    __metadata("design:type", String)
], Pedido.prototype, "estadoPago", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_confirmacion', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Pedido.prototype, "fechaConfirmacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_listo', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Pedido.prototype, "fechaListo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_entrega', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Pedido.prototype, "fechaEntrega", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motivo_cancelacion', length: 500, nullable: true }),
    __metadata("design:type", String)
], Pedido.prototype, "motivoCancelacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notas', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Pedido.prototype, "notas", void 0);
Pedido = __decorate([
    (0, typeorm_1.Entity)({ name: 'pedido', schema: process.env.DB_SCHEMA || 'public' }),
    (0, typeorm_1.Index)(['clienteId', 'sucursalId']),
    (0, typeorm_1.Index)(['clienteId', 'codigoPedido'], { unique: true }),
    (0, typeorm_1.Index)(['conversacionId'], { unique: true, where: 'conversacion_id IS NOT NULL' }),
    __metadata("design:paramtypes", [Object])
], Pedido);
exports.Pedido = Pedido;
//# sourceMappingURL=pedido.entity.js.map