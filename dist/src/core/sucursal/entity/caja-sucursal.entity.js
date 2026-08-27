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
exports.CajaSucursal = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let CajaSucursal = class CajaSucursal extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], CajaSucursal.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], CajaSucursal.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sucursal_id', type: 'bigint' }),
    __metadata("design:type", String)
], CajaSucursal.prototype, "sucursalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_id', type: 'bigint' }),
    __metadata("design:type", String)
], CajaSucursal.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_apertura', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], CajaSucursal.prototype, "fechaApertura", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monto_apertura', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], CajaSucursal.prototype, "montoApertura", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_cierre', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], CajaSucursal.prototype, "fechaCierre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monto_cierre_declarado', type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], CajaSucursal.prototype, "montoCierreDeclarado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monto_cierre_calculado', type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], CajaSucursal.prototype, "montoCierreCalculado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'diferencia', type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], CajaSucursal.prototype, "diferencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_caja', length: 50, default: 'abierta' }),
    __metadata("design:type", String)
], CajaSucursal.prototype, "estadoCaja", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notas', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CajaSucursal.prototype, "notas", void 0);
CajaSucursal = __decorate([
    (0, typeorm_1.Entity)({ name: 'caja_sucursal', schema: process.env.DB_SCHEMA || 'public' }),
    (0, typeorm_1.Index)(['clienteId', 'sucursalId', 'estado']),
    __metadata("design:paramtypes", [Object])
], CajaSucursal);
exports.CajaSucursal = CajaSucursal;
//# sourceMappingURL=caja-sucursal.entity.js.map