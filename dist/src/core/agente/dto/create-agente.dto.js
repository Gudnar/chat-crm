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
exports.UpdateAgenteDto = exports.CreateAgenteDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateAgenteDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Sofía' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAgenteDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Agente de ventas y soporte', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAgenteDto.prototype, "descripcion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'claude-haiku-4-5', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAgenteDto.prototype, "modelo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'profesional', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAgenteDto.prototype, "tono", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'español', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAgenteDto.prototype, "idioma", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 256, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(64),
    (0, class_validator_1.Max)(4096),
    __metadata("design:type", Number)
], CreateAgenteDto.prototype, "maxTokens", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAgenteDto.prototype, "systemPrompt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'hybrid', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAgenteDto.prototype, "modoOperacion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '✦', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAgenteDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '#6366f1', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAgenteDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Si está activo, reenvía un mensaje cuando una conversación queda pendiente sin foto/ubicación por N horas' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAgenteDto.prototype, "recordatorioActivo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(72),
    __metadata("design:type", Number)
], CreateAgenteDto.prototype, "recordatorioHoras", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAgenteDto.prototype, "recordatorioMensaje", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Si está activo, avisa al cliente N horas antes de una llamada ya agendada con agendar_cita' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAgenteDto.prototype, "recordatorioCitaActivo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(72),
    __metadata("design:type", Number)
], CreateAgenteDto.prototype, "recordatorioCitaHoras", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAgenteDto.prototype, "recordatorioCitaMensaje", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Plantilla aprobada a usar si el aviso cae fuera de la ventana de 24h' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAgenteDto.prototype, "recordatorioCitaPlantillaId", void 0);
exports.CreateAgenteDto = CreateAgenteDto;
class UpdateAgenteDto extends CreateAgenteDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAgenteDto.prototype, "activo", void 0);
exports.UpdateAgenteDto = UpdateAgenteDto;
//# sourceMappingURL=create-agente.dto.js.map