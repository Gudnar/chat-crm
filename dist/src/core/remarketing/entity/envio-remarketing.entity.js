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
exports.EnvioRemarketing = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
const campana_remarketing_entity_1 = require("./campana-remarketing.entity");
const cliente_entity_1 = require("../../cliente/entity/cliente.entity");
let EnvioRemarketing = class EnvioRemarketing extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], EnvioRemarketing.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'campana_id', type: 'bigint' }),
    __metadata("design:type", String)
], EnvioRemarketing.prototype, "campanaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conversacion_id', type: 'bigint' }),
    __metadata("design:type", String)
], EnvioRemarketing.prototype, "conversacionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contacto', length: 200 }),
    __metadata("design:type", String)
], EnvioRemarketing.prototype, "contacto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'score_al_envio', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], EnvioRemarketing.prototype, "scoreAlEnvio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_envio', length: 20, default: 'pendiente' }),
    __metadata("design:type", String)
], EnvioRemarketing.prototype, "estadoEnvio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mensaje_enviado', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EnvioRemarketing.prototype, "mensajeEnviado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'enviado_en', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], EnvioRemarketing.prototype, "enviadoEn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error', type: 'text', nullable: true }),
    __metadata("design:type", String)
], EnvioRemarketing.prototype, "error", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], EnvioRemarketing.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => campana_remarketing_entity_1.CampanaRemarketing),
    (0, typeorm_1.JoinColumn)({ name: 'campana_id' }),
    __metadata("design:type", campana_remarketing_entity_1.CampanaRemarketing)
], EnvioRemarketing.prototype, "campana", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cliente_entity_1.Cliente),
    (0, typeorm_1.JoinColumn)({ name: 'cliente_id' }),
    __metadata("design:type", cliente_entity_1.Cliente)
], EnvioRemarketing.prototype, "cliente", void 0);
EnvioRemarketing = __decorate([
    (0, typeorm_1.Entity)({ name: 'envio_remarketing', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], EnvioRemarketing);
exports.EnvioRemarketing = EnvioRemarketing;
//# sourceMappingURL=envio-remarketing.entity.js.map