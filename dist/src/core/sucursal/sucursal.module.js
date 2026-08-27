"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SucursalModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const sucursal_entity_1 = require("./entity/sucursal.entity");
const inventario_sucursal_entity_1 = require("./entity/inventario-sucursal.entity");
const cliente_final_entity_1 = require("./entity/cliente-final.entity");
const pedido_entity_1 = require("./entity/pedido.entity");
const transaccion_entity_1 = require("./entity/transaccion.entity");
const caja_sucursal_entity_1 = require("./entity/caja-sucursal.entity");
const sucursal_service_1 = require("./service/sucursal.service");
const inventario_sucursal_service_1 = require("./service/inventario-sucursal.service");
const cliente_final_service_1 = require("./service/cliente-final.service");
const pedido_service_1 = require("./service/pedido.service");
const transaccion_service_1 = require("./service/transaccion.service");
const caja_sucursal_service_1 = require("./service/caja-sucursal.service");
const sucursal_controller_1 = require("./controller/sucursal.controller");
let SucursalModule = class SucursalModule {
};
SucursalModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([
                sucursal_entity_1.Sucursal,
                inventario_sucursal_entity_1.InventarioSucursal,
                cliente_final_entity_1.ClienteFinal,
                pedido_entity_1.Pedido,
                transaccion_entity_1.Transaccion,
                caja_sucursal_entity_1.CajaSucursal,
            ])],
        controllers: [sucursal_controller_1.SucursalController],
        providers: [
            sucursal_service_1.SucursalService,
            inventario_sucursal_service_1.InventarioSucursalService,
            cliente_final_service_1.ClienteFinalService,
            pedido_service_1.PedidoService,
            transaccion_service_1.TransaccionService,
            caja_sucursal_service_1.CajaSucursalService,
        ],
        exports: [
            sucursal_service_1.SucursalService,
            inventario_sucursal_service_1.InventarioSucursalService,
            cliente_final_service_1.ClienteFinalService,
            pedido_service_1.PedidoService,
            transaccion_service_1.TransaccionService,
            caja_sucursal_service_1.CajaSucursalService,
        ],
    })
], SucursalModule);
exports.SucursalModule = SucursalModule;
//# sourceMappingURL=sucursal.module.js.map