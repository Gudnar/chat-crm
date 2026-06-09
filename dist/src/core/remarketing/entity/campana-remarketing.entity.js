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
exports.CampanaRemarketing = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
const cliente_entity_1 = require("../../cliente/entity/cliente.entity");
let CampanaRemarketing = class CampanaRemarketing extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], CampanaRemarketing.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', length: 100 }),
    __metadata("design:type", String)
], CampanaRemarketing.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion', length: 500, nullable: true }),
    __metadata("design:type", String)
], CampanaRemarketing.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mensaje', type: 'text' }),
    __metadata("design:type", String)
], CampanaRemarketing.prototype, "mensaje", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_mensaje', length: 20, default: 'fijo' }),
    __metadata("design:type", String)
], CampanaRemarketing.prototype, "tipoMensaje", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'programado_en', type: 'timestamptz' }),
    __metadata("design:type", Date)
], CampanaRemarketing.prototype, "programadoEn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ejecutado_en', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], CampanaRemarketing.prototype, "ejecutadoEn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_campana', length: 20, default: 'pendiente' }),
    __metadata("design:type", String)
], CampanaRemarketing.prototype, "estadoCampana", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'score_min', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CampanaRemarketing.prototype, "scoreMin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'score_max', type: 'int', default: 100 }),
    __metadata("design:type", Number)
], CampanaRemarketing.prototype, "scoreMax", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'canal_objetivo', length: 20, default: 'whatsapp' }),
    __metadata("design:type", String)
], CampanaRemarketing.prototype, "canalObjetivo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_enviados', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CampanaRemarketing.prototype, "totalEnviados", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_errores', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], CampanaRemarketing.prototype, "totalErrores", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], CampanaRemarketing.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cliente_entity_1.Cliente),
    (0, typeorm_1.JoinColumn)({ name: 'cliente_id' }),
    __metadata("design:type", cliente_entity_1.Cliente)
], CampanaRemarketing.prototype, "cliente", void 0);
CampanaRemarketing = __decorate([
    (0, typeorm_1.Entity)({ name: 'campana_remarketing', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], CampanaRemarketing);
exports.CampanaRemarketing = CampanaRemarketing;
//# sourceMappingURL=campana-remarketing.entity.js.map