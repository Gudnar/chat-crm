"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const whatsapp_controller_1 = require("./controller/whatsapp.controller");
const plantilla_whatsapp_controller_1 = require("./controller/plantilla-whatsapp.controller");
const flow_whatsapp_controller_1 = require("./controller/flow-whatsapp.controller");
const whatsapp_service_1 = require("./service/whatsapp.service");
const whatsapp_webhook_service_1 = require("./service/whatsapp-webhook.service");
const transcripcion_audio_service_1 = require("./service/transcripcion-audio.service");
const recordatorio_service_1 = require("./service/recordatorio.service");
const recordatorio_cita_service_1 = require("./service/recordatorio-cita.service");
const plantilla_whatsapp_service_1 = require("./service/plantilla-whatsapp.service");
const flow_whatsapp_service_1 = require("./service/flow-whatsapp.service");
const plantilla_whatsapp_entity_1 = require("./entity/plantilla-whatsapp.entity");
const flow_whatsapp_entity_1 = require("./entity/flow-whatsapp.entity");
const cliente_module_1 = require("../cliente/cliente.module");
const conversacion_module_1 = require("../conversacion/conversacion.module");
const agente_module_1 = require("../agente/agente.module");
const herramienta_module_1 = require("../herramienta/herramienta.module");
const tool_executor_service_1 = require("../herramienta/service/tool-executor.service");
const base_conocimiento_module_1 = require("../base-conocimiento/base-conocimiento.module");
const producto_module_1 = require("../producto/producto.module");
const red_social_module_1 = require("../red-social/red-social.module");
const recurso_module_1 = require("../recurso/recurso.module");
const reservacion_module_1 = require("../reservacion/reservacion.module");
const tienda_module_1 = require("../tienda/tienda.module");
const sucursal_module_1 = require("../sucursal/sucursal.module");
let WhatsappModule = class WhatsappModule {
};
WhatsappModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([plantilla_whatsapp_entity_1.PlantillaWhatsapp, flow_whatsapp_entity_1.FlowWhatsapp]),
            cliente_module_1.ClienteModule,
            conversacion_module_1.ConversacionModule,
            agente_module_1.AgenteModule,
            herramienta_module_1.HerramientaModule,
            base_conocimiento_module_1.BaseConocimientoModule,
            producto_module_1.ProductoModule,
            recurso_module_1.RecursoModule,
            reservacion_module_1.ReservacionModule,
            sucursal_module_1.SucursalModule,
            (0, common_1.forwardRef)(() => red_social_module_1.RedSocialModule),
            (0, common_1.forwardRef)(() => tienda_module_1.TiendaModule),
        ],
        controllers: [whatsapp_controller_1.WhatsappController, plantilla_whatsapp_controller_1.PlantillaWhatsappController, flow_whatsapp_controller_1.FlowWhatsappController],
        providers: [whatsapp_service_1.WhatsappService, whatsapp_webhook_service_1.WhatsappWebhookService, transcripcion_audio_service_1.TranscripcionAudioService, tool_executor_service_1.ToolExecutorService, recordatorio_service_1.RecordatorioService, recordatorio_cita_service_1.RecordatorioCitaService, plantilla_whatsapp_service_1.PlantillaWhatsappService, flow_whatsapp_service_1.FlowWhatsappService],
        exports: [whatsapp_service_1.WhatsappService, plantilla_whatsapp_service_1.PlantillaWhatsappService, flow_whatsapp_service_1.FlowWhatsappService],
    })
], WhatsappModule);
exports.WhatsappModule = WhatsappModule;
//# sourceMappingURL=whatsapp.module.js.map