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
exports.Agente = void 0;
const typeorm_1 = require("typeorm");
const cliente_entity_1 = require("../../cliente/entity/cliente.entity");
const usuario_entity_1 = require("../../usuario/entity/usuario.entity");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let Agente = class Agente extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], Agente.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', length: 100 }),
    __metadata("design:type", String)
], Agente.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'tipo_agente', length: 20, default: 'ia' }),
    __metadata("design:type", String)
], Agente.prototype, "tipoAgente", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'usuario_id', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], Agente.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'usuario_id' }),
    __metadata("design:type", Object)
], Agente.prototype, "usuarioAcceso", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'estado_disponibilidad', length: 20, default: 'inactivo' }),
    __metadata("design:type", String)
], Agente.prototype, "estadoDisponibilidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sesion_activa', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Agente.prototype, "sesionActiva", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ultimo_acceso', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Agente.prototype, "ultimoAcceso", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'horas_trabajo', type: 'jsonb', default: '{}' }),
    __metadata("design:type", Object)
], Agente.prototype, "horasTrabajo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'especialidades', type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], Agente.prototype, "especialidades", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion', length: 500, nullable: true }),
    __metadata("design:type", String)
], Agente.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'modelo', length: 100, default: 'claude-haiku-4-5' }),
    __metadata("design:type", String)
], Agente.prototype, "modelo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tono', length: 50, default: 'profesional' }),
    __metadata("design:type", String)
], Agente.prototype, "tono", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'idioma', length: 20, default: 'español' }),
    __metadata("design:type", String)
], Agente.prototype, "idioma", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_tokens', type: 'int', default: 256 }),
    __metadata("design:type", Number)
], Agente.prototype, "maxTokens", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'system_prompt', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Agente.prototype, "systemPrompt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'modo_operacion', length: 20, default: 'hybrid' }),
    __metadata("design:type", String)
], Agente.prototype, "modoOperacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activo', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Agente.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'avatar', length: 10, default: '✦' }),
    __metadata("design:type", String)
], Agente.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'color', length: 20, default: '#6366f1' }),
    __metadata("design:type", String)
], Agente.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_conversaciones', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Agente.prototype, "totalConversaciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_mensajes', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Agente.prototype, "totalMensajes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Agente.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cliente_entity_1.Cliente),
    (0, typeorm_1.JoinColumn)({ name: 'cliente_id' }),
    __metadata("design:type", cliente_entity_1.Cliente)
], Agente.prototype, "cliente", void 0);
Agente = __decorate([
    (0, typeorm_1.Entity)({ name: 'agente', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], Agente);
exports.Agente = Agente;
//# sourceMappingURL=agente.entity.js.map