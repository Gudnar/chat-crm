"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WhatsappController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const whatsapp_service_1 = require("../service/whatsapp.service");
const whatsapp_webhook_service_1 = require("../service/whatsapp-webhook.service");
const red_social_webhook_service_1 = require("../../red-social/service/red-social-webhook.service");
const red_social_service_1 = require("../../red-social/service/red-social.service");
const configuracion_cliente_service_1 = require("../../cliente/service/configuracion-cliente.service");
const whatsapp_dto_1 = require("../dto/whatsapp.dto");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
let WhatsappController = WhatsappController_1 = class WhatsappController {
    constructor(waService, webhookService, redSocialWebhookService, redSocialService, confClienteService) {
        this.waService = waService;
        this.webhookService = webhookService;
        this.redSocialWebhookService = redSocialWebhookService;
        this.redSocialService = redSocialService;
        this.confClienteService = confClienteService;
        this.logger = new common_1.Logger(WhatsappController_1.name);
    }
    async verificarWebhook(query, res) {
        const mode = query['hub.mode'];
        const token = query['hub.verify_token'];
        const challenge = query['hub.challenge'];
        if (mode !== 'subscribe') {
            res.sendStatus(403);
            return;
        }
        const clienteId = await this.confClienteService.resolverClientePorVerifyToken(token);
        if (clienteId) {
            this.logger.log(`[WA] Webhook verificado para cliente ${clienteId}`);
            res.status(200).send(challenge);
            return;
        }
        const cuenta = await this.redSocialService.resolverCuentaPorVerifyToken(token);
        if (cuenta) {
            this.logger.log(`[FB/IG] Webhook verificado para cuenta ${cuenta.id} (${cuenta.plataforma})`);
            res.status(200).send(challenge);
            return;
        }
        this.logger.warn(`[Webhook] Verificación fallida — token: ${token}`);
        res.sendStatus(403);
    }
    async recibirWebhook(body) {
        const obj = body.object;
        if (obj === 'whatsapp_business_account') {
            try {
                for (const entry of body.entry || []) {
                    for (const change of entry.changes || []) {
                        const value = change.value;
                        if (!value)
                            continue;
                        const phoneNumberId = value.metadata?.phone_number_id || '';
                        const contacts = value.contacts || [];
                        for (const rawMessage of (value.messages || [])) {
                            const contact = contacts.find(c => c.wa_id === rawMessage.from);
                            const displayName = contact?.profile?.name || rawMessage.from;
                            this.webhookService.procesarMensajeEntrante(rawMessage, displayName, phoneNumberId)
                                .catch(err => this.logger.error(`[WA] Error async: ${err.message}`));
                        }
                    }
                }
            }
            catch (err) {
                this.logger.error(`[WA] Error procesando webhook: ${err.message}`);
            }
            return 'EVENT_RECEIVED';
        }
        if (obj === 'page' || obj === 'instagram') {
            try {
                for (const entry of body.entry || []) {
                    if (obj === 'instagram') {
                        this.redSocialWebhookService.procesarEventoInstagram(entry)
                            .catch(e => this.logger.error(`[IG] async error: ${e.message}`));
                    }
                    else {
                        this.redSocialWebhookService.procesarEventoFacebook(entry)
                            .catch(e => this.logger.error(`[FB] async error: ${e.message}`));
                    }
                }
            }
            catch (err) {
                this.logger.error(`[FB/IG] Error procesando webhook: ${err.message}`);
            }
            return 'EVENT_RECEIVED';
        }
        return 'EVENT_RECEIVED';
    }
    async obtenerConfig(req) {
        const config = await this.waService.obtenerConfig(req.user.clienteId);
        return { ...config, accessToken: config.accessToken ? '••••••••••••••••' : '' };
    }
    async guardarConfig(dto, req) {
        await this.waService.guardarConfig(req.user.clienteId, dto, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(null, 'Configuración WhatsApp guardada correctamente');
    }
    async testConexion(dto) {
        return this.waService.testConexion(dto.accessToken, dto.phoneNumberId);
    }
    async obtenerEstado(req) {
        return this.waService.obtenerEstadisticas(req.user.clienteId);
    }
    async enviarMensaje(dto, req) {
        const config = await this.waService.obtenerConfig(req.user.clienteId);
        const result = await this.waService.enviarTexto(dto.celular, dto.mensaje, config);
        return new success_response_dto_1.SuccessResponseDto(result, 'Mensaje enviado');
    }
};
__decorate([
    (0, common_1.Get)('webhook'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "verificarWebhook", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "recibirWebhook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('config'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "obtenerConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('config'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [whatsapp_dto_1.WhatsappConfigDto, Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "guardarConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('test-connection'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [whatsapp_dto_1.TestConexionDto]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "testConexion", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "obtenerEstado", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('send'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [whatsapp_dto_1.EnviarMensajeDto, Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "enviarMensaje", null);
WhatsappController = WhatsappController_1 = __decorate([
    (0, common_1.Controller)('whatsapp'),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService,
        whatsapp_webhook_service_1.WhatsappWebhookService,
        red_social_webhook_service_1.RedSocialWebhookService,
        red_social_service_1.RedSocialService,
        configuracion_cliente_service_1.ConfiguracionClienteService])
], WhatsappController);
exports.WhatsappController = WhatsappController;
//# sourceMappingURL=whatsapp.controller.js.map