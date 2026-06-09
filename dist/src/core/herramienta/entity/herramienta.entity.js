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
exports.Herramienta = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let Herramienta = class Herramienta extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], Herramienta.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'agente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Herramienta.prototype, "agenteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', length: 100 }),
    __metadata("design:type", String)
], Herramienta.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'label', length: 150 }),
    __metadata("design:type", String)
], Herramienta.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion', length: 500 }),
    __metadata("design:type", String)
], Herramienta.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parametros', type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], Herramienta.prototype, "parametros", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activa', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Herramienta.prototype, "activa", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'auto_confirmar', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Herramienta.prototype, "autoConfirmar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'confianza_minima', type: 'int', default: 70 }),
    __metadata("design:type", Number)
], Herramienta.prototype, "confianzaMinima", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'color', length: 20, default: '#6366f1' }),
    __metadata("design:type", String)
], Herramienta.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'icono', length: 50, default: 'check' }),
    __metadata("design:type", String)
], Herramienta.prototype, "icono", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ejemplo', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Herramienta.prototype, "ejemplo", void 0);
Herramienta = __decorate([
    (0, typeorm_1.Entity)({ name: 'herramienta', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], Herramienta);
exports.Herramienta = Herramienta;
//# sourceMappingURL=herramienta.entity.js.map