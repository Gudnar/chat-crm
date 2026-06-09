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
exports.ConfiguracionCliente = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
const cliente_entity_1 = require("./cliente.entity");
let ConfiguracionCliente = class ConfiguracionCliente extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], ConfiguracionCliente.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], ConfiguracionCliente.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'clave', length: 100 }),
    __metadata("design:type", String)
], ConfiguracionCliente.prototype, "clave", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'valor', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConfiguracionCliente.prototype, "valor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo', length: 30, default: 'string' }),
    __metadata("design:type", String)
], ConfiguracionCliente.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion', length: 300, nullable: true }),
    __metadata("design:type", String)
], ConfiguracionCliente.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'es_secreto', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], ConfiguracionCliente.prototype, "esSecreto", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cliente_entity_1.Cliente, c => c.configuraciones),
    (0, typeorm_1.JoinColumn)({ name: 'cliente_id' }),
    __metadata("design:type", cliente_entity_1.Cliente)
], ConfiguracionCliente.prototype, "cliente", void 0);
ConfiguracionCliente = __decorate([
    (0, typeorm_1.Entity)({ name: 'configuracion_cliente', schema: process.env.DB_SCHEMA || 'public' }),
    (0, typeorm_1.Index)(['clienteId', 'clave'], { unique: true }),
    __metadata("design:paramtypes", [Object])
], ConfiguracionCliente);
exports.ConfiguracionCliente = ConfiguracionCliente;
//# sourceMappingURL=configuracion-cliente.entity.js.map