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
exports.ConfirmarPedidoDto = exports.ElegirSucursalDto = exports.ActualizarItemCarritoDto = exports.AgregarItemCarritoDto = exports.OpcionSeleccionadaDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class OpcionSeleccionadaDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OpcionSeleccionadaDto.prototype, "grupoId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OpcionSeleccionadaDto.prototype, "opcionId", void 0);
exports.OpcionSeleccionadaDto = OpcionSeleccionadaDto;
class AgregarItemCarritoDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AgregarItemCarritoDto.prototype, "articuloId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AgregarItemCarritoDto.prototype, "cantidad", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AgregarItemCarritoDto.prototype, "notas", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: [OpcionSeleccionadaDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], AgregarItemCarritoDto.prototype, "opcionesSeleccionadas", void 0);
exports.AgregarItemCarritoDto = AgregarItemCarritoDto;
class ActualizarItemCarritoDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ActualizarItemCarritoDto.prototype, "cantidad", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ActualizarItemCarritoDto.prototype, "notas", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: [OpcionSeleccionadaDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ActualizarItemCarritoDto.prototype, "opcionesSeleccionadas", void 0);
exports.ActualizarItemCarritoDto = ActualizarItemCarritoDto;
class ElegirSucursalDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ElegirSucursalDto.prototype, "sucursalId", void 0);
exports.ElegirSucursalDto = ElegirSucursalDto;
class ConfirmarPedidoDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: ['qr', 'efectivo'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['qr', 'efectivo']),
    __metadata("design:type", String)
], ConfirmarPedidoDto.prototype, "metodoPago", void 0);
exports.ConfirmarPedidoDto = ConfirmarPedidoDto;
//# sourceMappingURL=carrito-tienda.dto.js.map