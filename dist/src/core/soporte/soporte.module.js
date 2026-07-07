"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoporteModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const caso_entity_1 = require("./entity/caso.entity");
const conversacion_entity_1 = require("../conversacion/entity/conversacion.entity");
const soporte_service_1 = require("./service/soporte.service");
const soporte_controller_1 = require("./controller/soporte.controller");
let SoporteModule = class SoporteModule {
};
SoporteModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([caso_entity_1.CasoSoporte, conversacion_entity_1.Conversacion])],
        controllers: [soporte_controller_1.SoporteController],
        providers: [soporte_service_1.SoporteService],
        exports: [soporte_service_1.SoporteService],
    })
], SoporteModule);
exports.SoporteModule = SoporteModule;
//# sourceMappingURL=soporte.module.js.map