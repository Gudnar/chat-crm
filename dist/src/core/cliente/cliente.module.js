"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClienteModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cliente_entity_1 = require("./entity/cliente.entity");
const configuracion_cliente_entity_1 = require("./entity/configuracion-cliente.entity");
const cliente_service_1 = require("./service/cliente.service");
const configuracion_cliente_service_1 = require("./service/configuracion-cliente.service");
const cliente_controller_1 = require("./controller/cliente.controller");
const configuracion_cliente_controller_1 = require("./controller/configuracion-cliente.controller");
const mi_cuenta_module_1 = require("../mi-cuenta/mi-cuenta.module");
let ClienteModule = class ClienteModule {
};
ClienteModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([cliente_entity_1.Cliente, configuracion_cliente_entity_1.ConfiguracionCliente]), mi_cuenta_module_1.MiCuentaModule],
        providers: [cliente_service_1.ClienteService, configuracion_cliente_service_1.ConfiguracionClienteService],
        exports: [cliente_service_1.ClienteService, configuracion_cliente_service_1.ConfiguracionClienteService],
        controllers: [cliente_controller_1.ClienteController, configuracion_cliente_controller_1.ConfiguracionClienteController],
    })
], ClienteModule);
exports.ClienteModule = ClienteModule;
//# sourceMappingURL=cliente.module.js.map