"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const agente_google_calendar_entity_1 = require("./entity/agente-google-calendar.entity");
const google_calendar_service_1 = require("./service/google-calendar.service");
const agente_google_calendar_service_1 = require("./service/agente-google-calendar.service");
const google_calendar_sync_service_1 = require("./service/google-calendar-sync.service");
const google_calendar_polling_service_1 = require("./service/google-calendar-polling.service");
const google_calendar_controller_1 = require("./controller/google-calendar.controller");
const agente_humano_module_1 = require("../agente-humano/agente-humano.module");
const reservacion_module_1 = require("../reservacion/reservacion.module");
let GoogleCalendarModule = class GoogleCalendarModule {
};
GoogleCalendarModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([agente_google_calendar_entity_1.AgenteGoogleCalendar]),
            agente_humano_module_1.AgenteHumanoModule,
            (0, common_1.forwardRef)(() => reservacion_module_1.ReservacionModule),
            config_1.ConfigModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.get('JWT_SECRET') || 'ide_ia_secret',
                }),
            }),
        ],
        providers: [google_calendar_service_1.GoogleCalendarService, agente_google_calendar_service_1.AgenteGoogleCalendarService, google_calendar_sync_service_1.GoogleCalendarSyncService, google_calendar_polling_service_1.GoogleCalendarPollingService],
        exports: [google_calendar_sync_service_1.GoogleCalendarSyncService],
        controllers: [google_calendar_controller_1.GoogleCalendarController],
    })
], GoogleCalendarModule);
exports.GoogleCalendarModule = GoogleCalendarModule;
//# sourceMappingURL=google-calendar.module.js.map