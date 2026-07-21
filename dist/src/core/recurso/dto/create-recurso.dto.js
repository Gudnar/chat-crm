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
exports.UpdateRecursoDto = exports.CreateRecursoDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const recurso_entity_1 = require("../entity/recurso.entity");
class CreateRecursoDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Catálogo Garanted 2026' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRecursoDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: recurso_entity_1.TipoRecurso, description: 'Se deduce del archivo; solo obligatorio con urlExterna' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(recurso_entity_1.TipoRecurso),
    __metadata("design:type", String)
], CreateRecursoDto.prototype, "tipo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'catalogo' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRecursoDto.prototype, "categoria", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'catalogo,precios,productos', description: 'CSV o JSON array' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateRecursoDto.prototype, "keywords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRecursoDto.prototype, "descripcion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRecursoDto.prototype, "agenteId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Si el archivo está hospedado fuera' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({ require_tld: false }),
    __metadata("design:type", String)
], CreateRecursoDto.prototype, "urlExterna", void 0);
exports.CreateRecursoDto = CreateRecursoDto;
class UpdateRecursoDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRecursoDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRecursoDto.prototype, "categoria", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateRecursoDto.prototype, "keywords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRecursoDto.prototype, "descripcion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRecursoDto.prototype, "agenteId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({ require_tld: false }),
    __metadata("design:type", String)
], UpdateRecursoDto.prototype, "urlExterna", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === 'true'),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateRecursoDto.prototype, "activo", void 0);
exports.UpdateRecursoDto = UpdateRecursoDto;
//# sourceMappingURL=create-recurso.dto.js.map