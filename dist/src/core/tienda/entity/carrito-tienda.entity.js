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
exports.CarritoTienda = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let CarritoTienda = class CarritoTienda extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], CarritoTienda.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], CarritoTienda.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ name: 'token', type: 'varchar', length: 64 }),
    __metadata("design:type", String)
], CarritoTienda.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conversacion_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], CarritoTienda.prototype, "conversacionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contacto_telefono', length: 30, nullable: true }),
    __metadata("design:type", String)
], CarritoTienda.prototype, "contactoTelefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sucursal_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], CarritoTienda.prototype, "sucursalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'codigo_pedido', type: 'varchar', length: 30, nullable: true }),
    __metadata("design:type", String)
], CarritoTienda.prototype, "codigoPedido", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'metodo_pago', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], CarritoTienda.prototype, "metodoPago", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_carrito', length: 20, default: 'activo' }),
    __metadata("design:type", String)
], CarritoTienda.prototype, "estadoCarrito", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'items', type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], CarritoTienda.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CarritoTienda.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'confirmado_en', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], CarritoTienda.prototype, "confirmadoEn", void 0);
CarritoTienda = __decorate([
    (0, typeorm_1.Entity)({ name: 'carrito_tienda', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], CarritoTienda);
exports.CarritoTienda = CarritoTienda;
//# sourceMappingURL=carrito-tienda.entity.js.map