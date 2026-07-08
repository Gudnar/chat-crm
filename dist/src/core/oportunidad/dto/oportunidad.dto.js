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
exports.EditarHistorialDto = exports.AsignarOportunidadDto = exports.RegistrarSeguimientoDto = exports.CambiarEstadoOportunidadDto = exports.UpdateOportunidadDto = exports.CreateOportunidadDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const constants_1 = require("../../../common/constants");
class CreateOportunidadDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Juan Pérez' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateOportunidadDto.prototype, "contactoNombre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+59171234567' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateOportunidadDto.prototype, "contactoTelefono", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'juan@empresa.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], CreateOportunidadDto.prototype, "contactoEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Importadora Andina SRL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateOportunidadDto.prototype, "empresa", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: Object.values(constants_1.OrigenOportunidad), default: 'otro' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(Object.values(constants_1.OrigenOportunidad)),
    __metadata("design:type", String)
], CreateOportunidadDto.prototype, "origen", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'TOYOTA BZ5 2025 Pro 550' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], CreateOportunidadDto.prototype, "productoInteres", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 33963 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateOportunidadDto.prototype, "montoEstimado", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'USD', default: 'USD' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], CreateOportunidadDto.prototype, "moneda", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['baja', 'media', 'alta'], default: 'media' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['baja', 'media', 'alta']),
    __metadata("design:type", String)
], CreateOportunidadDto.prototype, "prioridad", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Conversación del chat vinculada' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOportunidadDto.prototype, "conversacionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Usuario responsable del seguimiento' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOportunidadDto.prototype, "asignadoA", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOportunidadDto.prototype, "notas", void 0);
exports.CreateOportunidadDto = CreateOportunidadDto;
class UpdateOportunidadDto {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateOportunidadDto.prototype, "contactoNombre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateOportunidadDto.prototype, "contactoTelefono", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], UpdateOportunidadDto.prototype, "contactoEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateOportunidadDto.prototype, "empresa", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: Object.values(constants_1.OrigenOportunidad) }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(Object.values(constants_1.OrigenOportunidad)),
    __metadata("design:type", String)
], UpdateOportunidadDto.prototype, "origen", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], UpdateOportunidadDto.prototype, "productoInteres", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateOportunidadDto.prototype, "montoEstimado", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], UpdateOportunidadDto.prototype, "moneda", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['baja', 'media', 'alta'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['baja', 'media', 'alta']),
    __metadata("design:type", String)
], UpdateOportunidadDto.prototype, "prioridad", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOportunidadDto.prototype, "notas", void 0);
exports.UpdateOportunidadDto = UpdateOportunidadDto;
class CambiarEstadoOportunidadDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ enum: Object.values(constants_1.EstadoOportunidad) }),
    (0, class_validator_1.IsIn)(Object.values(constants_1.EstadoOportunidad)),
    __metadata("design:type", String)
], CambiarEstadoOportunidadDto.prototype, "estado", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Obligatorio al pasar a perdida o cancelada' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CambiarEstadoOportunidadDto.prototype, "motivo", void 0);
exports.CambiarEstadoOportunidadDto = CambiarEstadoOportunidadDto;
class RegistrarSeguimientoDto {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Se llamó al cliente, pidió la cotización por correo' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegistrarSeguimientoDto.prototype, "nota", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Enviar cotización por correo' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], RegistrarSeguimientoDto.prototype, "proximaAccion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-07-10T15:00:00Z' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegistrarSeguimientoDto.prototype, "proximaAccionFecha", void 0);
exports.RegistrarSeguimientoDto = RegistrarSeguimientoDto;
class AsignarOportunidadDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Id del usuario responsable' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AsignarOportunidadDto.prototype, "usuarioId", void 0);
exports.AsignarOportunidadDto = AsignarOportunidadDto;
class EditarHistorialDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Índice de la entrada dentro del historial' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], EditarHistorialDto.prototype, "indice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Texto corregido del seguimiento' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EditarHistorialDto.prototype, "detalles", void 0);
exports.EditarHistorialDto = EditarHistorialDto;
//# sourceMappingURL=oportunidad.dto.js.map