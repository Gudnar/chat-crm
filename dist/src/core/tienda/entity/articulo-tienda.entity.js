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
exports.ArticuloTienda = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let ArticuloTienda = class ArticuloTienda extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], ArticuloTienda.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], ArticuloTienda.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', length: 200 }),
    __metadata("design:type", String)
], ArticuloTienda.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ArticuloTienda.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'categoria', length: 100, nullable: true }),
    __metadata("design:type", String)
], ArticuloTienda.prototype, "categoria", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'imagen_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], ArticuloTienda.prototype, "imagenUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'precio', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ArticuloTienda.prototype, "precio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'moneda', length: 10, default: 'Bs' }),
    __metadata("design:type", String)
], ArticuloTienda.prototype, "moneda", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'grupos_opciones', type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], ArticuloTienda.prototype, "gruposOpciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activo', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ArticuloTienda.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'orden', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ArticuloTienda.prototype, "orden", void 0);
ArticuloTienda = __decorate([
    (0, typeorm_1.Entity)({ name: 'articulo_tienda', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], ArticuloTienda);
exports.ArticuloTienda = ArticuloTienda;
//# sourceMappingURL=articulo-tienda.entity.js.map