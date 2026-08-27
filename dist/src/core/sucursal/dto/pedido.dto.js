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
exports.UpdatePedidoEstadoPagoDto = exports.UpdatePedidoEstadoDto = exports.CreatePedidoDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreatePedidoDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Type)(() => String),
    __metadata("design:type", String)
], CreatePedidoDto.prototype, "sucursalId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+59123456789' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePedidoDto.prototype, "contactoTelefono", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: '1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => String),
    __metadata("design:type", String)
], CreatePedidoDto.prototype, "clienteFinalId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: '1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => String),
    __metadata("design:type", String)
], CreatePedidoDto.prototype, "conversacionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: [{ productoId: '1', nombre: 'Producto A', cantidad: 2, precioUnitario: 100, subtotal: 200 }] }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreatePedidoDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePedidoDto.prototype, "subtotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePedidoDto.prototype, "descuento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 200 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePedidoDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'recojo' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['recojo', 'delivery']),
    __metadata("design:type", String)
], CreatePedidoDto.prototype, "tipoEntrega", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreatePedidoDto.prototype, "direccionEntrega", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePedidoDto.prototype, "notas", void 0);
exports.CreatePedidoDto = CreatePedidoDto;
class UpdatePedidoEstadoDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsIn)(['pendiente_confirmacion', 'confirmado', 'en_preparacion', 'listo', 'en_camino', 'entregado', 'cancelado']),
    __metadata("design:type", String)
], UpdatePedidoEstadoDto.prototype, "estadoPedido", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePedidoEstadoDto.prototype, "motivoCancelacion", void 0);
exports.UpdatePedidoEstadoDto = UpdatePedidoEstadoDto;
class UpdatePedidoEstadoPagoDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsIn)(['pendiente', 'pagado', 'parcial', 'anulado']),
    __metadata("design:type", String)
], UpdatePedidoEstadoPagoDto.prototype, "estadoPago", void 0);
exports.UpdatePedidoEstadoPagoDto = UpdatePedidoEstadoPagoDto;
//# sourceMappingURL=pedido.dto.js.map