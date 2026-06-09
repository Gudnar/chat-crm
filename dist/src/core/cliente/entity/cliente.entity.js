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
exports.Cliente = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
const configuracion_cliente_entity_1 = require("./configuracion-cliente.entity");
let Cliente = class Cliente extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], Cliente.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', length: 200 }),
    __metadata("design:type", String)
], Cliente.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'slug', length: 100, unique: true }),
    __metadata("design:type", String)
], Cliente.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'logo_url', length: 500, nullable: true }),
    __metadata("design:type", String)
], Cliente.prototype, "logoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'correo_contacto', length: 150, nullable: true }),
    __metadata("design:type", String)
], Cliente.prototype, "correoContacto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'telefono', length: 30, nullable: true }),
    __metadata("design:type", String)
], Cliente.prototype, "telefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'plan', length: 30, default: 'basico' }),
    __metadata("design:type", String)
], Cliente.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activo', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Cliente.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dias_atencion', type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], Cliente.prototype, "diasAtencion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hora_inicio_atencion', length: 5, nullable: true }),
    __metadata("design:type", String)
], Cliente.prototype, "horaInicioAtencion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hora_fin_atencion', length: 5, nullable: true }),
    __metadata("design:type", String)
], Cliente.prototype, "horaFinAtencion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'horarios', type: 'jsonb', nullable: true, default: '[]' }),
    __metadata("design:type", Array)
], Cliente.prototype, "horarios", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'servicios', type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], Cliente.prototype, "servicios", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'metadatos', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Cliente.prototype, "metadatos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => configuracion_cliente_entity_1.ConfiguracionCliente, c => c.cliente),
    __metadata("design:type", Array)
], Cliente.prototype, "configuraciones", void 0);
Cliente = __decorate([
    (0, typeorm_1.Entity)({ name: 'cliente', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], Cliente);
exports.Cliente = Cliente;
//# sourceMappingURL=cliente.entity.js.map