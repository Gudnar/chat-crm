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
exports.Configuracion = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let Configuracion = class Configuracion extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], Configuracion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'clave', length: 100, unique: true }),
    __metadata("design:type", String)
], Configuracion.prototype, "clave", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'valor', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Configuracion.prototype, "valor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo', length: 30, default: 'string' }),
    __metadata("design:type", String)
], Configuracion.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion', length: 300, nullable: true }),
    __metadata("design:type", String)
], Configuracion.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'es_secreto', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Configuracion.prototype, "esSecreto", void 0);
Configuracion = __decorate([
    (0, typeorm_1.Entity)({ name: 'configuracion', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], Configuracion);
exports.Configuracion = Configuracion;
//# sourceMappingURL=configuracion.entity.js.map