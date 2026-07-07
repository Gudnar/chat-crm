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
exports.BaseConocimiento = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let BaseConocimiento = class BaseConocimiento extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], BaseConocimiento.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'agente_id', type: 'bigint' }),
    __metadata("design:type", String)
], BaseConocimiento.prototype, "agenteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pregunta', length: 500 }),
    __metadata("design:type", String)
], BaseConocimiento.prototype, "pregunta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'respuesta', type: 'text' }),
    __metadata("design:type", String)
], BaseConocimiento.prototype, "respuesta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'categoria', length: 100, nullable: true }),
    __metadata("design:type", String)
], BaseConocimiento.prototype, "categoria", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activo', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], BaseConocimiento.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'orden', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BaseConocimiento.prototype, "orden", void 0);
BaseConocimiento = __decorate([
    (0, typeorm_1.Entity)({ name: 'base_conocimiento', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], BaseConocimiento);
exports.BaseConocimiento = BaseConocimiento;
//# sourceMappingURL=base-conocimiento.entity.js.map