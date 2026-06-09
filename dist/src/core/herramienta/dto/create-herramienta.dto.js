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
exports.UpdateHerramientaDto = exports.CreateHerramientaDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateHerramientaDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHerramientaDto.prototype, "agenteId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'calificar_lead' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHerramientaDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Calificar Lead' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHerramientaDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHerramientaDto.prototype, "descripcion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], example: ['score: number (0-100)', 'razon: string'] }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateHerramientaDto.prototype, "parametros", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateHerramientaDto.prototype, "activa", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateHerramientaDto.prototype, "autoConfirmar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 70, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(40),
    (0, class_validator_1.Max)(99),
    __metadata("design:type", Number)
], CreateHerramientaDto.prototype, "confianzaMinima", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '#f59e0b', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHerramientaDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'qualify', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHerramientaDto.prototype, "icono", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHerramientaDto.prototype, "ejemplo", void 0);
exports.CreateHerramientaDto = CreateHerramientaDto;
class UpdateHerramientaDto extends CreateHerramientaDto {
}
exports.UpdateHerramientaDto = UpdateHerramientaDto;
//# sourceMappingURL=create-herramienta.dto.js.map