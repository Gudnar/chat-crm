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
exports.RedSocialCuenta = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
const cliente_entity_1 = require("../../cliente/entity/cliente.entity");
let RedSocialCuenta = class RedSocialCuenta extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], RedSocialCuenta.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'plataforma', length: 30 }),
    __metadata("design:type", String)
], RedSocialCuenta.prototype, "plataforma", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', length: 200 }),
    __metadata("design:type", String)
], RedSocialCuenta.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'page_id', length: 100 }),
    __metadata("design:type", String)
], RedSocialCuenta.prototype, "pageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'access_token', type: 'text', nullable: true }),
    __metadata("design:type", String)
], RedSocialCuenta.prototype, "accessToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'app_secret', length: 200, nullable: true }),
    __metadata("design:type", String)
], RedSocialCuenta.prototype, "appSecret", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'verify_token', length: 200, nullable: true, default: 'ide_ia_meta_token' }),
    __metadata("design:type", String)
], RedSocialCuenta.prototype, "verifyToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'agente_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], RedSocialCuenta.prototype, "agenteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'enabled', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], RedSocialCuenta.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], RedSocialCuenta.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cliente_entity_1.Cliente),
    (0, typeorm_1.JoinColumn)({ name: 'cliente_id' }),
    __metadata("design:type", cliente_entity_1.Cliente)
], RedSocialCuenta.prototype, "cliente", void 0);
RedSocialCuenta = __decorate([
    (0, typeorm_1.Entity)({ name: 'red_social_cuenta', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], RedSocialCuenta);
exports.RedSocialCuenta = RedSocialCuenta;
//# sourceMappingURL=red-social-cuenta.entity.js.map