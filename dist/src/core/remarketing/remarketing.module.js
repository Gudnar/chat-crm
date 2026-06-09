"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemarketingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const campana_remarketing_entity_1 = require("./entity/campana-remarketing.entity");
const envio_remarketing_entity_1 = require("./entity/envio-remarketing.entity");
const remarketing_service_1 = require("./service/remarketing.service");
const remarketing_controller_1 = require("./controller/remarketing.controller");
const whatsapp_module_1 = require("../whatsapp/whatsapp.module");
const conversacion_module_1 = require("../conversacion/conversacion.module");
const cliente_module_1 = require("../cliente/cliente.module");
let RemarketingModule = class RemarketingModule {
};
RemarketingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([campana_remarketing_entity_1.CampanaRemarketing, envio_remarketing_entity_1.EnvioRemarketing]),
            whatsapp_module_1.WhatsappModule,
            conversacion_module_1.ConversacionModule,
            cliente_module_1.ClienteModule,
        ],
        providers: [remarketing_service_1.RemarketingService],
        controllers: [remarketing_controller_1.RemarketingController],
    })
], RemarketingModule);
exports.RemarketingModule = RemarketingModule;
//# sourceMappingURL=remarketing.module.js.map