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
exports.PlantillaWhatsapp = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let PlantillaWhatsapp = class PlantillaWhatsapp extends auditoria_entity_1.AuditoriaEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], PlantillaWhatsapp.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], PlantillaWhatsapp.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', length: 100 }),
    __metadata("design:type", String)
], PlantillaWhatsapp.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'idioma', length: 10, default: 'es' }),
    __metadata("design:type", String)
], PlantillaWhatsapp.prototype, "idioma", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'categoria', length: 20, default: 'UTILITY' }),
    __metadata("design:type", String)
], PlantillaWhatsapp.prototype, "categoria", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_plantilla', length: 20, default: 'pendiente_meta' }),
    __metadata("design:type", String)
], PlantillaWhatsapp.prototype, "estadoPlantilla", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motivo_rechazo', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PlantillaWhatsapp.prototype, "motivoRechazo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'meta_template_id', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], PlantillaWhatsapp.prototype, "metaTemplateId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'componentes', type: 'jsonb' }),
    __metadata("design:type", Object)
], PlantillaWhatsapp.prototype, "componentes", void 0);
PlantillaWhatsapp = __decorate([
    (0, typeorm_1.Entity)({ name: 'plantilla_whatsapp', schema: process.env.DB_SCHEMA || 'public' })
], PlantillaWhatsapp);
exports.PlantillaWhatsapp = PlantillaWhatsapp;
//# sourceMappingURL=plantilla-whatsapp.entity.js.map