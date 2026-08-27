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
exports.UpdateExcepcionHorarioAgenteDto = exports.CreateExcepcionHorarioAgenteDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const TIPOS_EXCEPCION = ['feriado', 'vacacion', 'aniversario', 'otro'];
class CreateExcepcionHorarioAgenteDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Vacío/ausente = bloquea a todo el equipo humano del cliente' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExcepcionHorarioAgenteDto.prototype, "agenteId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-12-25' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateExcepcionHorarioAgenteDto.prototype, "fechaInicio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-12-25' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateExcepcionHorarioAgenteDto.prototype, "fechaFin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Feriado nacional' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateExcepcionHorarioAgenteDto.prototype, "motivo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: TIPOS_EXCEPCION }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(TIPOS_EXCEPCION),
    __metadata("design:type", String)
], CreateExcepcionHorarioAgenteDto.prototype, "tipo", void 0);
exports.CreateExcepcionHorarioAgenteDto = CreateExcepcionHorarioAgenteDto;
class UpdateExcepcionHorarioAgenteDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateExcepcionHorarioAgenteDto.prototype, "agenteId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateExcepcionHorarioAgenteDto.prototype, "fechaInicio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateExcepcionHorarioAgenteDto.prototype, "fechaFin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateExcepcionHorarioAgenteDto.prototype, "motivo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: TIPOS_EXCEPCION }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(TIPOS_EXCEPCION),
    __metadata("design:type", String)
], UpdateExcepcionHorarioAgenteDto.prototype, "tipo", void 0);
exports.UpdateExcepcionHorarioAgenteDto = UpdateExcepcionHorarioAgenteDto;
//# sourceMappingURL=excepcion-horario-agente.dto.js.map