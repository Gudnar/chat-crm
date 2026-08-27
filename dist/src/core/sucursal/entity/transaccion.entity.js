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
exports.Transaccion = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let Transaccion = class Transaccion extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], Transaccion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Transaccion.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sucursal_id', type: 'bigint' }),
    __metadata("design:type", String)
], Transaccion.prototype, "sucursalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pedido_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], Transaccion.prototype, "pedidoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'caja_sucursal_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], Transaccion.prototype, "cajaSucursalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo', length: 50 }),
    __metadata("design:type", String)
], Transaccion.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'metodo_pago', length: 50, nullable: true }),
    __metadata("design:type", String)
], Transaccion.prototype, "metodoPago", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monto', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Transaccion.prototype, "monto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_transaccion', length: 50, default: 'confirmado' }),
    __metadata("design:type", String)
], Transaccion.prototype, "estadoTransaccion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'referencia', length: 200, nullable: true }),
    __metadata("design:type", String)
], Transaccion.prototype, "referencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Transaccion.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Transaccion.prototype, "fecha", void 0);
Transaccion = __decorate([
    (0, typeorm_1.Entity)({ name: 'transaccion', schema: process.env.DB_SCHEMA || 'public' }),
    (0, typeorm_1.Index)(['clienteId', 'sucursalId', 'fecha']),
    (0, typeorm_1.Index)(['pedidoId'], { where: 'pedido_id IS NOT NULL' }),
    __metadata("design:paramtypes", [Object])
], Transaccion);
exports.Transaccion = Transaccion;
//# sourceMappingURL=transaccion.entity.js.map