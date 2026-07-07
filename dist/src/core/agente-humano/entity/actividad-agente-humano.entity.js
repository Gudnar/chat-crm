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
exports.ActividadAgenteHumano = void 0;
const typeorm_1 = require("typeorm");
let ActividadAgenteHumano = class ActividadAgenteHumano extends typeorm_1.BaseEntity {
    constructor(data) {
        super();
        if (data)
            Object.assign(this, data);
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id', type: 'bigint' }),
    __metadata("design:type", String)
], ActividadAgenteHumano.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'agente_humano_id', type: 'bigint' }),
    __metadata("design:type", String)
], ActividadAgenteHumano.prototype, "agenteHumanoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conversacion_id', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], ActividadAgenteHumano.prototype, "conversacionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_actividad', length: 50 }),
    __metadata("design:type", String)
], ActividadAgenteHumano.prototype, "tipoActividad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'detalles', type: 'jsonb', default: '{}' }),
    __metadata("design:type", Object)
], ActividadAgenteHumano.prototype, "detalles", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'timestamp', type: 'timestamptz', default: () => 'now()' }),
    __metadata("design:type", Date)
], ActividadAgenteHumano.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'bigint' }),
    __metadata("design:type", String)
], ActividadAgenteHumano.prototype, "clienteId", void 0);
ActividadAgenteHumano = __decorate([
    (0, typeorm_1.Entity)({ name: 'actividad_agente_humano', schema: process.env.DB_SCHEMA || 'public' }),
    __metadata("design:paramtypes", [Object])
], ActividadAgenteHumano);
exports.ActividadAgenteHumano = ActividadAgenteHumano;
//# sourceMappingURL=actividad-agente-humano.entity.js.map