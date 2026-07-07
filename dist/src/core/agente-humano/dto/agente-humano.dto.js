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
exports.CerrarConversacionDto = exports.AsignarConversacionDto = exports.CambiarDisponibilidadDto = exports.UpdateAgenteHumanoDto = exports.CreateAgenteHumanoDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateAgenteHumanoDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Carlos' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAgenteHumanoDto.prototype, "nombres", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mendoza', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAgenteHumanoDto.prototype, "apellidos", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'carlos.mendoza@empresa.com', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateAgenteHumanoDto.prototype, "correoElectronico", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'carlos.mendoza', description: 'Usuario de acceso a la plataforma' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAgenteHumanoDto.prototype, "usuario", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Contraseña de acceso' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], CreateAgenteHumanoDto.prototype, "contrasena", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: '👨‍💼' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAgenteHumanoDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: '#22c55e' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAgenteHumanoDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: ['ventas', 'soporte técnico'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateAgenteHumanoDto.prototype, "especialidades", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Horario laboral por día', example: { lunes: { inicio: '09:00', fin: '18:00' } } }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateAgenteHumanoDto.prototype, "horasTrabajo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAgenteHumanoDto.prototype, "descripcion", void 0);
exports.CreateAgenteHumanoDto = CreateAgenteHumanoDto;
class UpdateAgenteHumanoDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAgenteHumanoDto.prototype, "nombres", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAgenteHumanoDto.prototype, "apellidos", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateAgenteHumanoDto.prototype, "correoElectronico", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Nueva contraseña (opcional)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], UpdateAgenteHumanoDto.prototype, "contrasena", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAgenteHumanoDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAgenteHumanoDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateAgenteHumanoDto.prototype, "especialidades", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateAgenteHumanoDto.prototype, "horasTrabajo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAgenteHumanoDto.prototype, "descripcion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAgenteHumanoDto.prototype, "activo", void 0);
exports.UpdateAgenteHumanoDto = UpdateAgenteHumanoDto;
class CambiarDisponibilidadDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'disponible', enum: ['inactivo', 'disponible', 'ocupado', 'ausente'] }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsIn)(['inactivo', 'disponible', 'ocupado', 'ausente']),
    __metadata("design:type", String)
], CambiarDisponibilidadDto.prototype, "estado", void 0);
exports.CambiarDisponibilidadDto = CambiarDisponibilidadDto;
class AsignarConversacionDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AsignarConversacionDto.prototype, "conversacionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AsignarConversacionDto.prototype, "agenteHumanoId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AsignarConversacionDto.prototype, "razon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'true si proviene de una escalada desde IA' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AsignarConversacionDto.prototype, "esEscalada", void 0);
exports.AsignarConversacionDto = AsignarConversacionDto;
class CerrarConversacionDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'Cliente satisfecho con la solución' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CerrarConversacionDto.prototype, "resolucion", void 0);
exports.CerrarConversacionDto = CerrarConversacionDto;
//# sourceMappingURL=agente-humano.dto.js.map