"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgenteHumanoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const agente_entity_1 = require("../agente/entity/agente.entity");
const usuario_entity_1 = require("../usuario/entity/usuario.entity");
const conversacion_entity_1 = require("../conversacion/entity/conversacion.entity");
const asignacion_agente_humano_entity_1 = require("./entity/asignacion-agente-humano.entity");
const actividad_agente_humano_entity_1 = require("./entity/actividad-agente-humano.entity");
const agente_humano_service_1 = require("./service/agente-humano.service");
const asignacion_service_1 = require("./service/asignacion.service");
const agente_humano_controller_1 = require("./controller/agente-humano.controller");
let AgenteHumanoModule = class AgenteHumanoModule {
};
AgenteHumanoModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                agente_entity_1.Agente,
                usuario_entity_1.Usuario,
                conversacion_entity_1.Conversacion,
                asignacion_agente_humano_entity_1.AsignacionAgenteHumano,
                actividad_agente_humano_entity_1.ActividadAgenteHumano,
            ]),
        ],
        providers: [agente_humano_service_1.AgenteHumanoService, asignacion_service_1.AsignacionService],
        exports: [agente_humano_service_1.AgenteHumanoService, asignacion_service_1.AsignacionService],
        controllers: [agente_humano_controller_1.AgenteHumanoController],
    })
], AgenteHumanoModule);
exports.AgenteHumanoModule = AgenteHumanoModule;
//# sourceMappingURL=agente-humano.module.js.map