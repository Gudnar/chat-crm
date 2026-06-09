"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiCuentaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cliente_entity_1 = require("../cliente/entity/cliente.entity");
const usuario_entity_1 = require("../usuario/entity/usuario.entity");
const rol_cliente_entity_1 = require("./entity/rol-cliente.entity");
const mi_cuenta_service_1 = require("./service/mi-cuenta.service");
const mi_cuenta_controller_1 = require("./controller/mi-cuenta.controller");
let MiCuentaModule = class MiCuentaModule {
};
MiCuentaModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([cliente_entity_1.Cliente, usuario_entity_1.Usuario, rol_cliente_entity_1.RolCliente])],
        providers: [mi_cuenta_service_1.MiCuentaService],
        controllers: [mi_cuenta_controller_1.MiCuentaController],
        exports: [mi_cuenta_service_1.MiCuentaService],
    })
], MiCuentaModule);
exports.MiCuentaModule = MiCuentaModule;
//# sourceMappingURL=mi-cuenta.module.js.map