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
exports.CreateTransaccionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreateTransaccionDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'venta' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsIn)(['venta', 'reembolso', 'gasto', 'ingreso_manual']),
    __metadata("design:type", String)
], CreateTransaccionDto.prototype, "tipo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'qr' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['qr', 'efectivo', 'transferencia', 'otro']),
    __metadata("design:type", String)
], CreateTransaccionDto.prototype, "metodoPago", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 150.00 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTransaccionDto.prototype, "monto", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: '1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => String),
    __metadata("design:type", String)
], CreateTransaccionDto.prototype, "pedidoId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: '1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => String),
    __metadata("design:type", String)
], CreateTransaccionDto.prototype, "cajaSucursalId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'REF-001' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransaccionDto.prototype, "referencia", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'Venta producto A' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransaccionDto.prototype, "descripcion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateTransaccionDto.prototype, "fecha", void 0);
exports.CreateTransaccionDto = CreateTransaccionDto;
//# sourceMappingURL=transaccion.dto.js.map