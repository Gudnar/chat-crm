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
exports.Recurso = exports.TipoRecurso = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
var TipoRecurso;
(function (TipoRecurso) {
    TipoRecurso["PDF"] = "PDF";
    TipoRecurso["IMAGEN"] = "IMAGEN";
    TipoRecurso["AUDIO"] = "AUDIO";
    TipoRecurso["VIDEO"] = "VIDEO";
})(TipoRecurso = exports.TipoRecurso || (exports.TipoRecurso = {}));
let Recurso = class Recurso extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], Recurso.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], Recurso.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'agente_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], Recurso.prototype, "agenteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', length: 200 }),
    __metadata("design:type", String)
], Recurso.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo', length: 50, enum: TipoRecurso }),
    __metadata("design:type", String)
], Recurso.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'categoria', length: 100, nullable: true }),
    __metadata("design:type", String)
], Recurso.prototype, "categoria", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'keywords', type: 'text', array: true, default: () => 'ARRAY[]::text[]' }),
    __metadata("design:type", Array)
], Recurso.prototype, "keywords", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Recurso.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'archivo_local', length: 255, nullable: true }),
    __metadata("design:type", String)
], Recurso.prototype, "archivoLocal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'url_externa', length: 500, nullable: true }),
    __metadata("design:type", String)
], Recurso.prototype, "urlExterna", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tamano_bytes', type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], Recurso.prototype, "tamanobytes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mime_type', length: 50, nullable: true }),
    __metadata("design:type", String)
], Recurso.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activo', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Recurso.prototype, "activo", void 0);
Recurso = __decorate([
    (0, typeorm_1.Entity)({ name: 'recurso', schema: process.env.DB_SCHEMA || 'public' }),
    (0, typeorm_1.Index)('idx_recurso_cliente_categoria', ['clienteId', 'categoria']),
    __metadata("design:paramtypes", [Object])
], Recurso);
exports.Recurso = Recurso;
//# sourceMappingURL=recurso.entity.js.map