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
exports.InventarioSucursal = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let InventarioSucursal = class InventarioSucursal extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], InventarioSucursal.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sucursal_id', type: 'bigint' }),
    __metadata("design:type", String)
], InventarioSucursal.prototype, "sucursalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'producto_id', type: 'bigint' }),
    __metadata("design:type", String)
], InventarioSucursal.prototype, "productoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stock', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], InventarioSucursal.prototype, "stock", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stock_minimo', type: 'int', default: 5 }),
    __metadata("design:type", Number)
], InventarioSucursal.prototype, "stockMinimo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activo', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], InventarioSucursal.prototype, "activo", void 0);
InventarioSucursal = __decorate([
    (0, typeorm_1.Entity)({ name: 'inventario_sucursal', schema: process.env.DB_SCHEMA || 'public' }),
    (0, typeorm_1.Index)(['sucursalId', 'productoId'], { unique: true }),
    __metadata("design:paramtypes", [Object])
], InventarioSucursal);
exports.InventarioSucursal = InventarioSucursal;
//# sourceMappingURL=inventario-sucursal.entity.js.map