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
exports.AuditoriaEntity = void 0;
const typeorm_1 = require("typeorm");
const constants_1 = require("../constants");
class AuditoriaEntity extends typeorm_1.BaseEntity {
    insertarTransaccion() {
        this.transaccion = this.transaccion || constants_1.Transacccion.CREAR;
    }
    actualizarTransaccion() {
        this.transaccion = this.transaccion || constants_1.Transacccion.ACTUALIZAR;
    }
    constructor(data) {
        super();
        if (data)
            Object.assign(this, data);
    }
}
__decorate([
    (0, typeorm_1.Column)({ name: '_estado', length: 30, type: 'varchar', nullable: false }),
    __metadata("design:type", String)
], AuditoriaEntity.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { name: '_transaccion', length: 30, nullable: false }),
    __metadata("design:type", String)
], AuditoriaEntity.prototype, "transaccion", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', { name: '_usuario_creacion', nullable: false }),
    __metadata("design:type", String)
], AuditoriaEntity.prototype, "usuarioCreacion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: '_fecha_creacion',
        type: 'timestamp without time zone',
        nullable: false,
        default: () => 'now()',
    }),
    __metadata("design:type", Date)
], AuditoriaEntity.prototype, "fechaCreacion", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', { name: '_usuario_modificacion', nullable: true }),
    __metadata("design:type", Object)
], AuditoriaEntity.prototype, "usuarioModificacion", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        name: '_fecha_modificacion',
        type: 'timestamp without time zone',
        nullable: true,
    }),
    __metadata("design:type", Object)
], AuditoriaEntity.prototype, "fechaModificacion", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuditoriaEntity.prototype, "insertarTransaccion", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuditoriaEntity.prototype, "actualizarTransaccion", null);
exports.AuditoriaEntity = AuditoriaEntity;
//# sourceMappingURL=auditoria.entity.js.map