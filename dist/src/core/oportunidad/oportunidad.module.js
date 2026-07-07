"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OportunidadModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const oportunidad_venta_entity_1 = require("./entity/oportunidad-venta.entity");
const conversacion_entity_1 = require("../conversacion/entity/conversacion.entity");
const usuario_entity_1 = require("../usuario/entity/usuario.entity");
const oportunidad_service_1 = require("./service/oportunidad.service");
const oportunidad_controller_1 = require("./controller/oportunidad.controller");
let OportunidadModule = class OportunidadModule {
};
OportunidadModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([oportunidad_venta_entity_1.OportunidadVenta, conversacion_entity_1.Conversacion, usuario_entity_1.Usuario])],
        controllers: [oportunidad_controller_1.OportunidadController],
        providers: [oportunidad_service_1.OportunidadService],
        exports: [oportunidad_service_1.OportunidadService],
    })
], OportunidadModule);
exports.OportunidadModule = OportunidadModule;
//# sourceMappingURL=oportunidad.module.js.map