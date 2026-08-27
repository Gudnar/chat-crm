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
exports.PromocionTienda = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let PromocionTienda = class PromocionTienda extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], PromocionTienda.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], PromocionTienda.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'articulo_id', type: 'bigint' }),
    __metadata("design:type", String)
], PromocionTienda.prototype, "articuloId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sucursal_id', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], PromocionTienda.prototype, "sucursalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'precio_promocional', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PromocionTienda.prototype, "precioPromocional", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_inicio', type: 'timestamptz' }),
    __metadata("design:type", Date)
], PromocionTienda.prototype, "fechaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_fin', type: 'timestamptz' }),
    __metadata("design:type", Date)
], PromocionTienda.prototype, "fechaFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activo', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PromocionTienda.prototype, "activo", void 0);
PromocionTienda = __decorate([
    (0, typeorm_1.Entity)({ name: 'promocion_tienda', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], PromocionTienda);
exports.PromocionTienda = PromocionTienda;
//# sourceMappingURL=promocion-tienda.entity.js.map