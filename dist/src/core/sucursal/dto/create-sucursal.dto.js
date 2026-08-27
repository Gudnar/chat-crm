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
exports.UpdateSucursalDto = exports.CreateSucursalDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreateSucursalDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Sucursal La Paz' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSucursalDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'LPZ' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSucursalDto.prototype, "codigo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'Calle Principal 123' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSucursalDto.prototype, "direccion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: '+59123456789' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSucursalDto.prototype, "telefono", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: -16.489733 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSucursalDto.prototype, "latitud", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: -68.119293 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSucursalDto.prototype, "longitud", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: { lunes: { inicio: '08:00', fin: '18:00' } } }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateSucursalDto.prototype, "horarios", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSucursalDto.prototype, "aceptaPagoQr", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSucursalDto.prototype, "aceptaPagoEfectivo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'https://...' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSucursalDto.prototype, "qrImagenUrl", void 0);
exports.CreateSucursalDto = CreateSucursalDto;
class UpdateSucursalDto extends CreateSucursalDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSucursalDto.prototype, "activo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSucursalDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSucursalDto.prototype, "codigo", void 0);
exports.UpdateSucursalDto = UpdateSucursalDto;
//# sourceMappingURL=create-sucursal.dto.js.map