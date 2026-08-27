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
exports.ClienteFinal = void 0;
const typeorm_1 = require("typeorm");
const auditoria_entity_1 = require("../../../common/entity/auditoria.entity");
let ClienteFinal = class ClienteFinal extends auditoria_entity_1.AuditoriaEntity {
    constructor(data) {
        super(data);
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], ClienteFinal.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], ClienteFinal.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sucursal_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], ClienteFinal.prototype, "sucursalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre', length: 200 }),
    __metadata("design:type", String)
], ClienteFinal.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'telefono', length: 20 }),
    __metadata("design:type", String)
], ClienteFinal.prototype, "telefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'direcciones', type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], ClienteFinal.prototype, "direcciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notas', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ClienteFinal.prototype, "notas", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_pedidos', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ClienteFinal.prototype, "totalPedidos", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_gastado', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ClienteFinal.prototype, "totalGastado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ultima_compra', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], ClienteFinal.prototype, "ultimaCompra", void 0);
ClienteFinal = __decorate([
    (0, typeorm_1.Entity)({ name: 'cliente_final', schema: process.env.DB_SCHEMA || 'public' }),
    (0, typeorm_1.Index)(['clienteId', 'telefono'], { unique: true }),
    __metadata("design:paramtypes", [Object])
], ClienteFinal);
exports.ClienteFinal = ClienteFinal;
//# sourceMappingURL=cliente-final.entity.js.map