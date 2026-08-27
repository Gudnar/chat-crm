"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservacionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const reserva_entity_1 = require("./entity/reserva.entity");
const horario_agente_entity_1 = require("./entity/horario-agente.entity");
const servicio_agente_entity_1 = require("./entity/servicio-agente.entity");
const excepcion_horario_agente_entity_1 = require("./entity/excepcion-horario-agente.entity");
const reservacion_service_1 = require("./service/reservacion.service");
const horario_agente_service_1 = require("./service/horario-agente.service");
const servicio_agente_service_1 = require("./service/servicio-agente.service");
const excepcion_horario_agente_service_1 = require("./service/excepcion-horario-agente.service");
const reservacion_controller_1 = require("./controller/reservacion.controller");
const horario_agente_controller_1 = require("./controller/horario-agente.controller");
const servicio_agente_controller_1 = require("./controller/servicio-agente.controller");
const excepcion_horario_agente_controller_1 = require("./controller/excepcion-horario-agente.controller");
const agente_module_1 = require("../agente/agente.module");
const agente_humano_module_1 = require("../agente-humano/agente-humano.module");
const google_calendar_module_1 = require("../google-calendar/google-calendar.module");
let ReservacionModule = class ReservacionModule {
};
ReservacionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([reserva_entity_1.Reserva, horario_agente_entity_1.HorarioAgente, servicio_agente_entity_1.ServicioAgente, excepcion_horario_agente_entity_1.ExcepcionHorarioAgente]),
            agente_module_1.AgenteModule,
            agente_humano_module_1.AgenteHumanoModule,
            (0, common_1.forwardRef)(() => google_calendar_module_1.GoogleCalendarModule),
        ],
        providers: [excepcion_horario_agente_service_1.ExcepcionHorarioAgenteService, reservacion_service_1.ReservacionService, horario_agente_service_1.HorarioAgenteService, servicio_agente_service_1.ServicioAgenteService],
        exports: [excepcion_horario_agente_service_1.ExcepcionHorarioAgenteService, reservacion_service_1.ReservacionService, horario_agente_service_1.HorarioAgenteService, servicio_agente_service_1.ServicioAgenteService],
        controllers: [reservacion_controller_1.ReservacionController, horario_agente_controller_1.HorarioAgenteController, servicio_agente_controller_1.ServicioAgenteController, excepcion_horario_agente_controller_1.ExcepcionHorarioAgenteController],
    })
], ReservacionModule);
exports.ReservacionModule = ReservacionModule;
//# sourceMappingURL=reservacion.module.js.map