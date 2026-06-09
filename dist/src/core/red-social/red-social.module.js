"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedSocialModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const red_social_cuenta_entity_1 = require("./entity/red-social-cuenta.entity");
const red_social_post_entity_1 = require("./entity/red-social-post.entity");
const red_social_service_1 = require("./service/red-social.service");
const red_social_webhook_service_1 = require("./service/red-social-webhook.service");
const red_social_controller_1 = require("./controller/red-social.controller");
const red_social_cliente_controller_1 = require("./controller/red-social-cliente.controller");
const cliente_module_1 = require("../cliente/cliente.module");
const conversacion_module_1 = require("../conversacion/conversacion.module");
const agente_module_1 = require("../agente/agente.module");
let RedSocialModule = class RedSocialModule {
};
RedSocialModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([red_social_cuenta_entity_1.RedSocialCuenta, red_social_post_entity_1.RedSocialPost]),
            cliente_module_1.ClienteModule,
            conversacion_module_1.ConversacionModule,
            agente_module_1.AgenteModule,
        ],
        controllers: [red_social_controller_1.RedSocialController, red_social_cliente_controller_1.RedSocialClienteController],
        providers: [red_social_service_1.RedSocialService, red_social_webhook_service_1.RedSocialWebhookService],
        exports: [red_social_service_1.RedSocialService, red_social_webhook_service_1.RedSocialWebhookService],
    })
], RedSocialModule);
exports.RedSocialModule = RedSocialModule;
//# sourceMappingURL=red-social.module.js.map