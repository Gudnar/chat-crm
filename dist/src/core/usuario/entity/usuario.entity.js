"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = void 0;
const typeorm_1 = require("typeorm");
const cliente_entity_1 = require("../../cliente/entity/cliente.entity");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
const bcrypt = __importStar(require("bcrypt"));
let Usuario = class Usuario extends auditoria_entity_1.AuditoriaEntity {
    async hashPassword() {
        if (this.contrasena) {
            this.contrasena = await bcrypt.hash(this.contrasena, 10);
        }
    }
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], Usuario.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario', length: 100, unique: true }),
    __metadata("design:type", String)
], Usuario.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contrasena', length: 255 }),
    __metadata("design:type", String)
], Usuario.prototype, "contrasena", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'correo_electronico', length: 150, nullable: true }),
    __metadata("design:type", String)
], Usuario.prototype, "correoElectronico", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombres', length: 150 }),
    __metadata("design:type", String)
], Usuario.prototype, "nombres", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'apellidos', length: 150, nullable: true }),
    __metadata("design:type", String)
], Usuario.prototype, "apellidos", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rol', length: 50, default: 'USER' }),
    __metadata("design:type", String)
], Usuario.prototype, "rol", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'intentos', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Usuario.prototype, "intentos", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_bloqueo', type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], Usuario.prototype, "fechaBloqueo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], Usuario.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cliente_entity_1.Cliente, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'cliente_id' }),
    __metadata("design:type", Object)
], Usuario.prototype, "cliente", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rol_cliente_id', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], Usuario.prototype, "rolClienteId", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Usuario.prototype, "hashPassword", null);
Usuario = __decorate([
    (0, typeorm_1.Entity)({ name: 'usuario', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], Usuario);
exports.Usuario = Usuario;
//# sourceMappingURL=usuario.entity.js.map