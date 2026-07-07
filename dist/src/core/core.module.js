"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const authentication_module_1 = require("./authentication/authentication.module");
const usuario_module_1 = require("./usuario/usuario.module");
const agente_module_1 = require("./agente/agente.module");
const herramienta_module_1 = require("./herramienta/herramienta.module");
const conversacion_module_1 = require("./conversacion/conversacion.module");
const configuracion_module_1 = require("./configuracion/configuracion.module");
const whatsapp_module_1 = require("./whatsapp/whatsapp.module");
const cliente_module_1 = require("./cliente/cliente.module");
const mi_cuenta_module_1 = require("./mi-cuenta/mi-cuenta.module");
const red_social_module_1 = require("./red-social/red-social.module");
const remarketing_module_1 = require("./remarketing/remarketing.module");
const base_conocimiento_module_1 = require("./base-conocimiento/base-conocimiento.module");
const producto_module_1 = require("./producto/producto.module");
const soporte_module_1 = require("./soporte/soporte.module");
const agente_humano_module_1 = require("./agente-humano/agente-humano.module");
const oportunidad_module_1 = require("./oportunidad/oportunidad.module");
let CoreModule = class CoreModule {
};
CoreModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('DB_HOST') || 'localhost',
                    port: Number(config.get('DB_PORT')) || 5432,
                    username: config.get('DB_USERNAME') || 'postgres',
                    password: config.get('DB_PASSWORD') || 'postgres',
                    database: config.get('DB_DATABASE') || 'ide_ia_db',
                    schema: config.get('DB_SCHEMA') || 'public',
                    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                    synchronize: config.get('NODE_ENV') !== 'production',
                    logging: config.get('LOG_SQL') === 'true',
                }),
            }),
            authentication_module_1.AuthenticationModule,
            usuario_module_1.UsuarioModule,
            agente_module_1.AgenteModule,
            herramienta_module_1.HerramientaModule,
            conversacion_module_1.ConversacionModule,
            configuracion_module_1.ConfiguracionModule,
            whatsapp_module_1.WhatsappModule,
            cliente_module_1.ClienteModule,
            mi_cuenta_module_1.MiCuentaModule,
            red_social_module_1.RedSocialModule,
            remarketing_module_1.RemarketingModule,
            base_conocimiento_module_1.BaseConocimientoModule,
            producto_module_1.ProductoModule,
            soporte_module_1.SoporteModule,
            agente_humano_module_1.AgenteHumanoModule,
            oportunidad_module_1.OportunidadModule,
        ],
    })
], CoreModule);
exports.CoreModule = CoreModule;
//# sourceMappingURL=core.module.js.map