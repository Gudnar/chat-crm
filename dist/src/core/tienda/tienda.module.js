"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiendaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const articulo_tienda_entity_1 = require("./entity/articulo-tienda.entity");
const carrito_tienda_entity_1 = require("./entity/carrito-tienda.entity");
const categoria_tienda_entity_1 = require("./entity/categoria-tienda.entity");
const promocion_tienda_entity_1 = require("./entity/promocion-tienda.entity");
const articulo_sucursal_entity_1 = require("./entity/articulo-sucursal.entity");
const tienda_service_1 = require("./service/tienda.service");
const tienda_publica_service_1 = require("./service/tienda-publica.service");
const promocion_tienda_service_1 = require("./service/promocion-tienda.service");
const tienda_controller_1 = require("./controller/tienda.controller");
const tienda_publica_controller_1 = require("./controller/tienda-publica.controller");
const cliente_module_1 = require("../cliente/cliente.module");
const conversacion_module_1 = require("../conversacion/conversacion.module");
const whatsapp_module_1 = require("../whatsapp/whatsapp.module");
const sucursal_module_1 = require("../sucursal/sucursal.module");
const sucursal_entity_1 = require("../sucursal/entity/sucursal.entity");
let TiendaModule = class TiendaModule {
};
TiendaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([articulo_tienda_entity_1.ArticuloTienda, carrito_tienda_entity_1.CarritoTienda, categoria_tienda_entity_1.CategoriaTienda, promocion_tienda_entity_1.PromocionTienda, articulo_sucursal_entity_1.ArticuloSucursal, sucursal_entity_1.Sucursal]),
            sucursal_module_1.SucursalModule,
            cliente_module_1.ClienteModule,
            conversacion_module_1.ConversacionModule,
            (0, common_1.forwardRef)(() => whatsapp_module_1.WhatsappModule),
        ],
        providers: [tienda_service_1.TiendaService, tienda_publica_service_1.TiendaPublicaService, promocion_tienda_service_1.PromocionTiendaService],
        exports: [tienda_service_1.TiendaService, tienda_publica_service_1.TiendaPublicaService, promocion_tienda_service_1.PromocionTiendaService],
        controllers: [tienda_controller_1.TiendaController, tienda_publica_controller_1.TiendaPublicaController],
    })
], TiendaModule);
exports.TiendaModule = TiendaModule;
//# sourceMappingURL=tienda.module.js.map