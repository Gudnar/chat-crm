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
exports.TiendaPublicaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tienda_publica_service_1 = require("../service/tienda-publica.service");
const carrito_tienda_dto_1 = require("../dto/carrito-tienda.dto");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
let TiendaPublicaController = class TiendaPublicaController {
    constructor(tiendaPublicaService) {
        this.tiendaPublicaService = tiendaPublicaService;
    }
    async obtenerTienda(slug, sucursalId) {
        const datos = await this.tiendaPublicaService.obtenerTienda(slug, sucursalId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crearSesion(slug) {
        const datos = await this.tiendaPublicaService.crearSesion(slug);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async elegirSucursal(slug, token, dto) {
        const datos = await this.tiendaPublicaService.elegirSucursal(slug, token, dto.sucursalId);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Sucursal seleccionada');
    }
    async obtenerCarrito(slug, token) {
        const datos = await this.tiendaPublicaService.obtenerCarrito(slug, token);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async agregarItem(slug, token, dto) {
        const datos = await this.tiendaPublicaService.agregarItem(slug, token, dto);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Agregado al carrito');
    }
    async actualizarItem(slug, token, itemId, dto) {
        const datos = await this.tiendaPublicaService.actualizarItem(slug, token, itemId, dto);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Carrito actualizado');
    }
    async eliminarItem(slug, token, itemId) {
        const datos = await this.tiendaPublicaService.eliminarItem(slug, token, itemId);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Ítem eliminado');
    }
    async confirmar(slug, token, dto) {
        const datos = await this.tiendaPublicaService.confirmar(slug, token, dto?.metodoPago);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Pedido confirmado');
    }
};
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Query)('sucursalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TiendaPublicaController.prototype, "obtenerTienda", null);
__decorate([
    (0, common_1.Post)(':slug/sesion'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TiendaPublicaController.prototype, "crearSesion", null);
__decorate([
    (0, common_1.Put)(':slug/sesion/:token/sucursal'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Param)('token')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, carrito_tienda_dto_1.ElegirSucursalDto]),
    __metadata("design:returntype", Promise)
], TiendaPublicaController.prototype, "elegirSucursal", null);
__decorate([
    (0, common_1.Get)(':slug/sesion/:token'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TiendaPublicaController.prototype, "obtenerCarrito", null);
__decorate([
    (0, common_1.Post)(':slug/sesion/:token/items'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Param)('token')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, carrito_tienda_dto_1.AgregarItemCarritoDto]),
    __metadata("design:returntype", Promise)
], TiendaPublicaController.prototype, "agregarItem", null);
__decorate([
    (0, common_1.Put)(':slug/sesion/:token/items/:itemId'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Param)('token')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, carrito_tienda_dto_1.ActualizarItemCarritoDto]),
    __metadata("design:returntype", Promise)
], TiendaPublicaController.prototype, "actualizarItem", null);
__decorate([
    (0, common_1.Delete)(':slug/sesion/:token/items/:itemId'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Param)('token')),
    __param(2, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TiendaPublicaController.prototype, "eliminarItem", null);
__decorate([
    (0, common_1.Post)(':slug/sesion/:token/confirmar'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Param)('token')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, carrito_tienda_dto_1.ConfirmarPedidoDto]),
    __metadata("design:returntype", Promise)
], TiendaPublicaController.prototype, "confirmar", null);
TiendaPublicaController = __decorate([
    (0, swagger_1.ApiTags)('Tienda pública'),
    (0, common_1.Controller)('tienda-publica'),
    __metadata("design:paramtypes", [tienda_publica_service_1.TiendaPublicaService])
], TiendaPublicaController);
exports.TiendaPublicaController = TiendaPublicaController;
//# sourceMappingURL=tienda-publica.controller.js.map