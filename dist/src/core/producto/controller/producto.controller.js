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
exports.ProductoController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const path_1 = require("path");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const producto_service_1 = require("../service/producto.service");
const create_producto_dto_1 = require("../dto/create-producto.dto");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
const imagenesStorage = (0, multer_1.diskStorage)({
    destination: (0, path_1.join)(process.cwd(), 'uploads', 'productos'),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${(0, path_1.extname)(file.originalname).toLowerCase()}`);
    },
});
const soloImagenes = (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        cb(new Error('Solo se permiten archivos de imagen (jpg, png, webp, etc.)'), false);
    }
    else {
        cb(null, true);
    }
};
let ProductoController = class ProductoController {
    constructor(productoService) {
        this.productoService = productoService;
    }
    async listar(q, categoria, pagina, limite, req) {
        const paginaNum = Math.max(1, parseInt(pagina, 10) || 1);
        const limiteNum = Math.min(100, Math.max(1, parseInt(limite, 10) || 25));
        const datos = await this.productoService.listar(req.user.clienteId, q, categoria, paginaNum, limiteNum);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async obtener(id, req) {
        const datos = await this.productoService.obtener(id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crear(dto, req) {
        const datos = await this.productoService.crear(dto, req.user.clienteId, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Producto creado correctamente');
    }
    async actualizar(id, dto, req) {
        const datos = await this.productoService.actualizar(id, dto, req.user.clienteId, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Producto actualizado correctamente');
    }
    async eliminar(id, req) {
        await this.productoService.eliminar(id, req.user.clienteId, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(null, 'Producto eliminado correctamente');
    }
    async subirImagenes(id, files, req) {
        const filenames = files.map(f => `productos/${f.filename}`);
        const datos = await this.productoService.agregarImagenes(id, filenames, req.user.clienteId, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, `${files.length} imagen(es) subida(s) correctamente`);
    }
    async eliminarImagen(id, filename, req) {
        const datos = await this.productoService.eliminarImagen(id, filename, req.user.clienteId, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Imagen eliminada correctamente');
    }
    async exportarExcel(req, res) {
        const buffer = await this.productoService.exportarExcel(req.user.clienteId);
        const fecha = new Date().toISOString().split('T')[0];
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="productos-${fecha}.xlsx"`,
        });
        res.send(buffer);
    }
    async importarExcel(file, req) {
        if (!file) {
            return new success_response_dto_1.SuccessResponseDto(null, 'Archivo requerido');
        }
        const resultado = await this.productoService.importarExcel(file.buffer, req.user.clienteId, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(resultado, `Importación completada: ${resultado.creados} creados, ${resultado.actualizados} actualizados`);
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('categoria')),
    __param(2, (0, common_1.Query)('pagina')),
    __param(3, (0, common_1.Query)('limite')),
    __param(4, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ProductoController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductoController.prototype, "obtener", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_producto_dto_1.CreateProductoDto, Object]),
    __metadata("design:returntype", Promise)
], ProductoController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_producto_dto_1.UpdateProductoDto, Object]),
    __metadata("design:returntype", Promise)
], ProductoController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductoController.prototype, "eliminar", null);
__decorate([
    (0, common_1.Post)(':id/imagenes'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('imagenes', 10, {
        storage: imagenesStorage,
        fileFilter: soloImagenes,
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], ProductoController.prototype, "subirImagenes", null);
__decorate([
    (0, common_1.Delete)(':id/imagenes'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('filename')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ProductoController.prototype, "eliminarImagen", null);
__decorate([
    (0, common_1.Get)('exportar/excel'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductoController.prototype, "exportarExcel", null);
__decorate([
    (0, common_1.Post)('importar/excel'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('archivo')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductoController.prototype, "importarExcel", null);
ProductoController = __decorate([
    (0, swagger_1.ApiTags)('Productos'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('productos'),
    __metadata("design:paramtypes", [producto_service_1.ProductoService])
], ProductoController);
exports.ProductoController = ProductoController;
//# sourceMappingURL=producto.controller.js.map