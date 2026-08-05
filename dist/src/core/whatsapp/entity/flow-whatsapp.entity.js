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
exports.FlowWhatsapp = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let FlowWhatsapp = class FlowWhatsapp extends auditoria_entity_1.AuditoriaEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], FlowWhatsapp.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], FlowWhatsapp.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', length: 100 }),
    __metadata("design:type", String)
], FlowWhatsapp.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'categoria', length: 30, default: 'OTHER' }),
    __metadata("design:type", String)
], FlowWhatsapp.prototype, "categoria", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_flow', length: 20, default: 'borrador' }),
    __metadata("design:type", String)
], FlowWhatsapp.prototype, "estadoFlow", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'meta_flow_id', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], FlowWhatsapp.prototype, "metaFlowId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'errores_validacion', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], FlowWhatsapp.prototype, "erroresValidacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cta', length: 20, default: 'Comenzar' }),
    __metadata("design:type", String)
], FlowWhatsapp.prototype, "cta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mensaje_cuerpo', type: 'text' }),
    __metadata("design:type", String)
], FlowWhatsapp.prototype, "mensajeCuerpo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'screen_title', length: 100, default: 'Formulario' }),
    __metadata("design:type", String)
], FlowWhatsapp.prototype, "screenTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'campos', type: 'jsonb' }),
    __metadata("design:type", Array)
], FlowWhatsapp.prototype, "campos", void 0);
FlowWhatsapp = __decorate([
    (0, typeorm_1.Entity)({ name: 'flow_whatsapp', schema: process.env.DB_SCHEMA || 'public' })
], FlowWhatsapp);
exports.FlowWhatsapp = FlowWhatsapp;
//# sourceMappingURL=flow-whatsapp.entity.js.map