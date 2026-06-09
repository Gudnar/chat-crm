"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversacionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const conversacion_entity_1 = require("./entity/conversacion.entity");
const conversacion_service_1 = require("./service/conversacion.service");
const calificacion_service_1 = require("./service/calificacion.service");
const conversacion_controller_1 = require("./controller/conversacion.controller");
const cliente_module_1 = require("../cliente/cliente.module");
let ConversacionModule = class ConversacionModule {
};
ConversacionModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([conversacion_entity_1.Conversacion]), cliente_module_1.ClienteModule],
        providers: [conversacion_service_1.ConversacionService, calificacion_service_1.CalificacionService],
        exports: [conversacion_service_1.ConversacionService, calificacion_service_1.CalificacionService, typeorm_1.TypeOrmModule],
        controllers: [conversacion_controller_1.ConversacionController],
    })
], ConversacionModule);
exports.ConversacionModule = ConversacionModule;
//# sourceMappingURL=conversacion.module.js.map