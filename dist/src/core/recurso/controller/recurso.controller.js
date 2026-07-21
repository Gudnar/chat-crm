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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecursoController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const recurso_service_1 = require("../service/recurso.service");
const create_recurso_dto_1 = require("../dto/create-recurso.dto");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
const recurso_entity_1 = require("../entity/recurso.entity");
const recurso_constants_1 = require("../recurso.constants");
const recursoStorage = (0, multer_1.diskStorage)({
    destination: (req, file, cb) => {
        const clienteId = req.user?.clienteId;
        if (!clienteId) {
            cb(new Error('Cliente no identificado'), '');
            return;
        }
        const tipo = (0, recurso_constants_1.detectarTipo)(file.mimetype);
        if (!tipo) {
            cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), '');
            return;
        }
        const dir = (0, path_1.join)(process.cwd(), 'uploads', 'recursos', String(clienteId), tipo.toLowerCase());
        try {
            (0, fs_1.mkdirSync)(dir, { recursive: true });
        }
        catch (err) {
            cb(err, '');
            return;
        }
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${(0, path_1.extname)(file.originalname).toLowerCase()}`);
    },
});
const filtroRecurso = (_req, file, cb) => {
    if (!(0, recurso_constants_1.detectarTipo)(file.mimetype)) {
        cb(new common_1.BadRequestException(`Tipo de archivo no permitido: ${file.mimetype}. Permitidos: ${(0, recurso_constants_1.mimesPermitidos)().join(', ')}`), false);
        return;
    }
    cb(null, true);
};
let RecursoController = class RecursoController {
    constructor(recursoService) {
        this.recursoService = recursoService;
    }
    async listar(tipo, categoria, activo, req) {
        const filtros = {
            tipo,
            categoria,
            activo: activo === 'true' ? true : activo === 'false' ? false : undefined,
        };
        const datos = await this.recursoService.listar(req.user.clienteId, filtros);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async buscar(keyword, req) {
        const datos = await this.recursoService.buscarPorKeywords(req.user.clienteId, keyword);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async obtenerTipos() {
        const tipos = this.recursoService.obtenerTiposPermitidos();
        const mimes = this.recursoService.obtenerMimeTypesPermitidos();
        return new success_response_dto_1.SuccessResponseDto({ tipos, mimes });
    }
    async obtener(id, req) {
        const datos = await this.recursoService.obtener(id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async obtenerUrl(id, req) {
        const url = await this.recursoService.obtenerUrlPublica(id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto({ url });
    }
    async crear(dto, archivo, req) {
        const datos = await this.recursoService.crear(dto, archivo, req.user.id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Recurso creado exitosamente');
    }
    async actualizar(id, dto, req) {
        const datos = await this.recursoService.actualizar(id, dto, req.user.id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Recurso actualizado');
    }
    async eliminar(id, req) {
        await this.recursoService.eliminar(id, req.user.id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(null, 'Recurso eliminado');
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('tipo')),
    __param(1, (0, common_1.Query)('categoria')),
    __param(2, (0, common_1.Query)('activo')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], RecursoController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('buscar/:keyword'),
    __param(0, (0, common_1.Param)('keyword')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RecursoController.prototype, "buscar", null);
__decorate([
    (0, common_1.Get)('tipos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecursoController.prototype, "obtenerTipos", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RecursoController.prototype, "obtener", null);
__decorate([
    (0, common_1.Get)(':id/url'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RecursoController.prototype, "obtenerUrl", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('archivo', {
        storage: recursoStorage,
        fileFilter: filtroRecurso,
        limits: { fileSize: recurso_constants_1.LIMITE_BYTES_GLOBAL },
    })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_recurso_dto_1.CreateRecursoDto, Object, Object]),
    __metadata("design:returntype", Promise)
], RecursoController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_recurso_dto_1.UpdateRecursoDto, Object]),
    __metadata("design:returntype", Promise)
], RecursoController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RecursoController.prototype, "eliminar", null);
RecursoController = __decorate([
    (0, swagger_1.ApiTags)('Recursos'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('recursos'),
    __metadata("design:paramtypes", [recurso_service_1.RecursoService])
], RecursoController);
exports.RecursoController = RecursoController;
//# sourceMappingURL=recurso.controller.js.map