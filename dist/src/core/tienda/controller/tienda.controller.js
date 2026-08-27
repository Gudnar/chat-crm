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
exports.TiendaController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const tienda_service_1 = require("../service/tienda.service");
const promocion_tienda_service_1 = require("../service/promocion-tienda.service");
const articulo_tienda_dto_1 = require("../dto/articulo-tienda.dto");
const categoria_tienda_dto_1 = require("../dto/categoria-tienda.dto");
const promocion_tienda_dto_1 = require("../dto/promocion-tienda.dto");
const cliente_service_1 = require("../../cliente/service/cliente.service");
const sucursal_service_1 = require("../../sucursal/service/sucursal.service");
const create_sucursal_dto_1 = require("../../sucursal/dto/create-sucursal.dto");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
const imagenMemoria = (0, multer_1.memoryStorage)();
const soloImagenes = (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        cb(new Error('Solo se permiten archivos de imagen (jpg, png, webp, etc.)'), false);
    }
    else {
        cb(null, true);
    }
};
function clienteIdDe(req) {
    const deSesion = req.user?.clienteId;
    if (deSesion)
        return String(deSesion);
    const deQuery = req.query?.clienteId;
    if (deQuery)
        return String(deQuery);
    throw new common_1.BadRequestException('Debes indicar el cliente a administrar (parametro clienteId)');
}
let TiendaController = class TiendaController {
    constructor(tiendaService, promocionService, sucursalService, clienteService) {
        this.tiendaService = tiendaService;
        this.promocionService = promocionService;
        this.sucursalService = sucursalService;
        this.clienteService = clienteService;
    }
    async listarSucursales(req) {
        const datos = await this.sucursalService.listar(clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crearSucursal(dto, req) {
        const datos = await this.sucursalService.crear(dto, clienteIdDe(req), req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Sucursal creada correctamente');
    }
    async actualizarSucursal(id, dto, req) {
        const datos = await this.sucursalService.actualizar(id, dto, clienteIdDe(req), req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Sucursal actualizada correctamente');
    }
    async eliminarSucursal(id, req) {
        await this.sucursalService.eliminar(id, clienteIdDe(req), req.user.id);
        return new success_response_dto_1.SuccessResponseDto(null, 'Sucursal eliminada correctamente');
    }
    async subirQrSucursal(id, file, req) {
        if (!file)
            throw new common_1.BadRequestException('Archivo requerido');
        const url = await this.tiendaService.guardarImagenProcesada(file.buffer, 'qr');
        const datos = await this.sucursalService.setImagenQr(id, url, clienteIdDe(req), req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'QR subido correctamente');
    }
    async listarCategorias(req) {
        const datos = await this.tiendaService.listarCategorias(clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crearCategoria(dto, req) {
        const datos = await this.tiendaService.crearCategoria(dto, clienteIdDe(req), req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Categoría creada correctamente');
    }
    async actualizarCategoria(id, dto, req) {
        const datos = await this.tiendaService.actualizarCategoria(id, dto, clienteIdDe(req), req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Categoría actualizada correctamente');
    }
    async eliminarCategoria(id, req) {
        await this.tiendaService.eliminarCategoria(id, clienteIdDe(req), req.user.id);
        return new success_response_dto_1.SuccessResponseDto(null, 'Categoría eliminada correctamente');
    }
    async subirImagenCategoria(id, file, req) {
        if (!file)
            throw new common_1.BadRequestException('Archivo requerido');
        const url = await this.tiendaService.guardarImagenProcesada(file.buffer, 'categoria');
        const datos = await this.tiendaService.setImagenCategoria(id, url, clienteIdDe(req), req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Imagen de categoría subida correctamente');
    }
    async listarPromociones(req) {
        const datos = await this.promocionService.listar(clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crearPromocion(dto, req) {
        const datos = await this.promocionService.crear(dto, clienteIdDe(req), req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Promoción creada correctamente');
    }
    async actualizarPromocion(id, dto, req) {
        const datos = await this.promocionService.actualizar(id, dto, clienteIdDe(req), req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Promoción actualizada correctamente');
    }
    async eliminarPromocion(id, req) {
        await this.promocionService.eliminar(id, clienteIdDe(req), req.user.id);
        return new success_response_dto_1.SuccessResponseDto(null, 'Promoción eliminada correctamente');
    }
    async subirPortada(clienteId, file, req) {
        if (!file)
            throw new common_1.BadRequestException('Archivo requerido');
        const url = await this.tiendaService.guardarImagenProcesada(file.buffer, 'banner');
        const datos = await this.clienteService.actualizar(clienteId, { tiendaPortadaUrl: url }, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Portada actualizada correctamente');
    }
    async listar(req) {
        const datos = await this.tiendaService.listar(clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async obtener(id, req) {
        const datos = await this.tiendaService.obtener(id, clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crear(dto, req) {
        const datos = await this.tiendaService.crear(dto, clienteIdDe(req), req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Artículo creado correctamente');
    }
    async actualizar(id, dto, req) {
        const datos = await this.tiendaService.actualizar(id, dto, clienteIdDe(req), req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Artículo actualizado correctamente');
    }
    async eliminar(id, req) {
        await this.tiendaService.eliminar(id, clienteIdDe(req), req.user.id);
        return new success_response_dto_1.SuccessResponseDto(null, 'Artículo eliminado correctamente');
    }
    async subirImagen(id, file, req) {
        if (!file)
            throw new common_1.BadRequestException('Archivo requerido');
        const url = await this.tiendaService.guardarImagenProcesada(file.buffer, 'producto');
        const datos = await this.tiendaService.setImagen(id, url, clienteIdDe(req), req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Imagen subida correctamente');
    }
    async listarDisponibilidad(id, req) {
        const datos = await this.tiendaService.listarDisponibilidad(id, clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async actualizarDisponibilidad(id, filas, req) {
        const datos = await this.tiendaService.actualizarDisponibilidad(id, filas, clienteIdDe(req), req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Disponibilidad actualizada correctamente');
    }
};
__decorate([
    (0, common_1.Get)('sucursales'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "listarSucursales", null);
__decorate([
    (0, common_1.Post)('sucursales'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sucursal_dto_1.CreateSucursalDto, Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "crearSucursal", null);
__decorate([
    (0, common_1.Put)('sucursales/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_sucursal_dto_1.UpdateSucursalDto, Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "actualizarSucursal", null);
__decorate([
    (0, common_1.Delete)('sucursales/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "eliminarSucursal", null);
__decorate([
    (0, common_1.Post)('sucursales/:id/qr'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('imagen', { storage: imagenMemoria, fileFilter: soloImagenes, limits: { fileSize: 5 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "subirQrSucursal", null);
__decorate([
    (0, common_1.Get)('categorias'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "listarCategorias", null);
__decorate([
    (0, common_1.Post)('categorias'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [categoria_tienda_dto_1.CreateCategoriaTiendaDto, Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "crearCategoria", null);
__decorate([
    (0, common_1.Put)('categorias/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, categoria_tienda_dto_1.UpdateCategoriaTiendaDto, Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "actualizarCategoria", null);
__decorate([
    (0, common_1.Delete)('categorias/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "eliminarCategoria", null);
__decorate([
    (0, common_1.Post)('categorias/:id/imagen'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('imagen', { storage: imagenMemoria, fileFilter: soloImagenes, limits: { fileSize: 5 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "subirImagenCategoria", null);
__decorate([
    (0, common_1.Get)('promociones'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "listarPromociones", null);
__decorate([
    (0, common_1.Post)('promociones'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [promocion_tienda_dto_1.CreatePromocionTiendaDto, Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "crearPromocion", null);
__decorate([
    (0, common_1.Put)('promociones/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, promocion_tienda_dto_1.UpdatePromocionTiendaDto, Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "actualizarPromocion", null);
__decorate([
    (0, common_1.Delete)('promociones/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "eliminarPromocion", null);
__decorate([
    (0, common_1.Post)('portada/:clienteId'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('imagen', { storage: imagenMemoria, fileFilter: soloImagenes, limits: { fileSize: 5 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)('clienteId')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "subirPortada", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "obtener", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [articulo_tienda_dto_1.CreateArticuloTiendaDto, Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "crear", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, articulo_tienda_dto_1.UpdateArticuloTiendaDto, Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "eliminar", null);
__decorate([
    (0, common_1.Post)(':id/imagen'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('imagen', { storage: imagenMemoria, fileFilter: soloImagenes, limits: { fileSize: 5 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "subirImagen", null);
__decorate([
    (0, common_1.Get)(':id/disponibilidad'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "listarDisponibilidad", null);
__decorate([
    (0, common_1.Put)(':id/disponibilidad'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "actualizarDisponibilidad", null);
TiendaController = __decorate([
    (0, swagger_1.ApiTags)('Tienda online'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN_CLIENTE', 'COLABORADOR'),
    (0, common_1.Controller)('tienda'),
    __metadata("design:paramtypes", [tienda_service_1.TiendaService,
        promocion_tienda_service_1.PromocionTiendaService,
        sucursal_service_1.SucursalService,
        cliente_service_1.ClienteService])
], TiendaController);
exports.TiendaController = TiendaController;
//# sourceMappingURL=tienda.controller.js.map