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
const whatsapp_controller_1 = require("./controller/whatsapp.controller");
const whatsapp_service_1 = require("./service/whatsapp.service");
const whatsapp_webhook_service_1 = require("./service/whatsapp-webhook.service");
const cliente_module_1 = require("../cliente/cliente.module");
const conversacion_module_1 = require("../conversacion/conversacion.module");
const agente_module_1 = require("../agente/agente.module");
const red_social_module_1 = require("../red-social/red-social.module");
let WhatsappModule = class WhatsappModule {
};
WhatsappModule = __decorate([
    (0, common_1.Module)({
        imports: [cliente_module_1.ClienteModule, conversacion_module_1.ConversacionModule, agente_module_1.AgenteModule, (0, common_1.forwardRef)(() => red_social_module_1.RedSocialModule)],
        controllers: [whatsapp_controller_1.WhatsappController],
        providers: [whatsapp_service_1.WhatsappService, whatsapp_webhook_service_1.WhatsappWebhookService],
        exports: [whatsapp_service_1.WhatsappService],
    })
], WhatsappModule);
exports.WhatsappModule = WhatsappModule;
//# sourceMappingURL=whatsapp.module.js.map