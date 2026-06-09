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
exports.RedSocialPost = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
const cliente_entity_1 = require("../../cliente/entity/cliente.entity");
let RedSocialPost = class RedSocialPost extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], RedSocialPost.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'plataforma', length: 30 }),
    __metadata("design:type", String)
], RedSocialPost.prototype, "plataforma", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'post_id', length: 200 }),
    __metadata("design:type", String)
], RedSocialPost.prototype, "postId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'titulo', length: 500 }),
    __metadata("design:type", String)
], RedSocialPost.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contenido', type: 'text', nullable: true }),
    __metadata("design:type", String)
], RedSocialPost.prototype, "contenido", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'image_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], RedSocialPost.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo', length: 30, nullable: true, default: 'post' }),
    __metadata("design:type", String)
], RedSocialPost.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'likes', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], RedSocialPost.prototype, "likes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'comentarios', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], RedSocialPost.prototype, "comentarios", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'compartidos', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], RedSocialPost.prototype, "compartidos", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alcance', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], RedSocialPost.prototype, "alcance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_post', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], RedSocialPost.prototype, "fechaPost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'comentarios_data', type: 'jsonb', nullable: true, default: [] }),
    __metadata("design:type", Array)
], RedSocialPost.prototype, "comentariosData", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'agente_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], RedSocialPost.prototype, "agenteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cuenta_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], RedSocialPost.prototype, "cuentaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'enabled', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], RedSocialPost.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], RedSocialPost.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cliente_entity_1.Cliente),
    (0, typeorm_1.JoinColumn)({ name: 'cliente_id' }),
    __metadata("design:type", cliente_entity_1.Cliente)
], RedSocialPost.prototype, "cliente", void 0);
RedSocialPost = __decorate([
    (0, typeorm_1.Entity)({ name: 'red_social_post', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], RedSocialPost);
exports.RedSocialPost = RedSocialPost;
//# sourceMappingURL=red-social-post.entity.js.map