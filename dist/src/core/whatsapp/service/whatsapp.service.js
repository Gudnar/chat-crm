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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WhatsappService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const configuracion_cliente_service_1 = require("../../cliente/service/configuracion-cliente.service");
const WA_API_VERSION = 'v19.0';
const WA_BASE_URL = `https://graph.facebook.com/${WA_API_VERSION}`;
let WhatsappService = WhatsappService_1 = class WhatsappService {
    constructor(confClienteService) {
        this.confClienteService = confClienteService;
        this.logger = new common_1.Logger(WhatsappService_1.name);
    }
    async obtenerConfig(clienteId) {
        const claves = ['WA_ACCESS_TOKEN', 'WA_PHONE_NUMBER_ID', 'WA_WABA_ID', 'WA_VERIFY_TOKEN', 'WA_AGENTE_ID', 'WA_ENABLED'];
        const configs = await Promise.all(claves.map(c => this.confClienteService.obtenerPorClave(clienteId, c)));
        return {
            accessToken: configs[0]?.valor || '',
            phoneNumberId: configs[1]?.valor || '',
            wabaId: configs[2]?.valor || '',
            verifyToken: configs[3]?.valor || 'ide_ia_verify_token',
            agenteId: configs[4]?.valor || '',
            enabled: configs[5]?.valor === 'true',
        };
    }
    async guardarConfig(clienteId, data, usuarioId) {
        const entries = [
            { clave: 'WA_PHONE_NUMBER_ID', valor: data.phoneNumberId ?? '', esSecreto: false, desc: 'WhatsApp Phone Number ID' },
            { clave: 'WA_WABA_ID', valor: data.wabaId ?? '', esSecreto: false, desc: 'WhatsApp Business Account ID' },
            { clave: 'WA_VERIFY_TOKEN', valor: data.verifyToken ?? '', esSecreto: false, desc: 'Token de verificación webhook' },
            { clave: 'WA_AGENTE_ID', valor: data.agenteId ?? '', esSecreto: false, desc: 'Agente IA asignado a WhatsApp' },
            { clave: 'WA_ENABLED', valor: String(data.enabled ?? false), esSecreto: false, desc: 'WhatsApp activo/inactivo' },
        ];
        if (data.accessToken && data.accessToken.trim()) {
            entries.push({ clave: 'WA_ACCESS_TOKEN', valor: data.accessToken.trim(), esSecreto: true, desc: 'WhatsApp Cloud API Access Token' });
        }
        for (const { clave, valor, esSecreto, desc } of entries) {
            if (valor !== '') {
                await this.confClienteService.set(clienteId, { clave, valor, esSecreto, descripcion: desc }, usuarioId);
            }
        }
    }
    async apiPost(phoneNumberId, accessToken, body) {
        const url = `${WA_BASE_URL}/${phoneNumberId}/messages`;
        const res = await axios_1.default.post(url, body, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        return res.data;
    }
    async enviarTexto(to, text, config) {
        if (!config.accessToken || !config.phoneNumberId) {
            this.logger.error(`[WA] Envío fallido — accessToken:${!!config.accessToken} phoneNumberId:${!!config.phoneNumberId}`, '');
            throw new Error('WhatsApp no configurado. Configura Access Token y Phone Number ID.');
        }
        const sanitized = to.replace(/\D/g, '');
        this.logger.log(`[WA] Enviando a ${sanitized} via phoneId=${config.phoneNumberId.slice(-4).padStart(config.phoneNumberId.length, '*')}`);
        try {
            const result = await this.apiPost(config.phoneNumberId, config.accessToken, {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: sanitized,
                type: 'text',
                text: { body: text },
            });
            this.logger.log(`[WA] Meta respondió: ${JSON.stringify(result)}`);
            return result;
        }
        catch (err) {
            const metaError = err?.response?.data?.error;
            this.logger.error(`[WA] Error Meta API: ${metaError?.message || err.message} (code=${metaError?.code})`, '');
            throw new Error(metaError?.message || err.message || 'Error enviando mensaje WhatsApp');
        }
    }
    async enviarImagen(to, imageUrl, caption, config) {
        try {
            await this.apiPost(config.phoneNumberId, config.accessToken, {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: to.replace(/\D/g, ''),
                type: 'image',
                image: { link: imageUrl, ...(caption ? { caption } : {}) },
            });
        }
        catch (err) {
            const msg = err?.response?.data?.error?.message || err.message;
            this.logger.warn(`[WA] No se pudo enviar imagen (${imageUrl}): ${msg}`);
        }
    }
    async enviarDocumento(to, documentUrl, filename, caption, config) {
        try {
            await this.apiPost(config.phoneNumberId, config.accessToken, {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: to.replace(/\D/g, ''),
                type: 'document',
                document: {
                    link: documentUrl,
                    ...(filename ? { filename } : {}),
                    ...(caption ? { caption } : {}),
                },
            });
        }
        catch (err) {
            const msg = err?.response?.data?.error?.message || err.message;
            this.logger.warn(`[WA] No se pudo enviar documento (${documentUrl}): ${msg}`);
        }
    }
    async enviarAudio(to, audioUrl, config) {
        try {
            await this.apiPost(config.phoneNumberId, config.accessToken, {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: to.replace(/\D/g, ''),
                type: 'audio',
                audio: { link: audioUrl },
            });
        }
        catch (err) {
            const msg = err?.response?.data?.error?.message || err.message;
            this.logger.warn(`[WA] No se pudo enviar audio (${audioUrl}): ${msg}`);
        }
    }
    async enviarVideo(to, videoUrl, caption, config) {
        try {
            await this.apiPost(config.phoneNumberId, config.accessToken, {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: to.replace(/\D/g, ''),
                type: 'video',
                video: { link: videoUrl, ...(caption ? { caption } : {}) },
            });
        }
        catch (err) {
            const msg = err?.response?.data?.error?.message || err.message;
            this.logger.warn(`[WA] No se pudo enviar video (${videoUrl}): ${msg}`);
        }
    }
    async marcarLeido(messageId, config) {
        try {
            await this.apiPost(config.phoneNumberId, config.accessToken, {
                messaging_product: 'whatsapp',
                status: 'read',
                message_id: messageId,
            });
        }
        catch { }
    }
    async mostrarTyping(messageId, config) {
        try {
            await this.apiPost(config.phoneNumberId, config.accessToken, {
                messaging_product: 'whatsapp',
                status: 'read',
                message_id: messageId,
                typing_indicator: { type: 'text' },
            });
        }
        catch { }
    }
    async testConexion(accessToken, phoneNumberId) {
        try {
            const res = await axios_1.default.get(`${WA_BASE_URL}/${phoneNumberId}`, {
                params: { fields: 'id,display_phone_number,verified_name,status,quality_rating' },
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const d = res.data;
            return {
                valida: true,
                info: {
                    displayPhone: d.display_phone_number,
                    verifiedName: d.verified_name,
                    status: d.status,
                    qualityRating: d.quality_rating,
                },
                mensaje: `✅ Conectado: ${d.verified_name || d.display_phone_number}`,
            };
        }
        catch (err) {
            const msg = err?.response?.data?.error?.message || err.message || 'Error de conexión';
            return { valida: false, mensaje: `❌ ${msg}` };
        }
    }
    async obtenerEstadisticas(clienteId) {
        const cfg = await this.obtenerConfig(clienteId);
        if (!cfg.accessToken || !cfg.wabaId) {
            return { valida: false, mensaje: 'WhatsApp no configurado' };
        }
        try {
            const [phoneRes, wabaRes] = await Promise.all([
                axios_1.default.get(`${WA_BASE_URL}/${cfg.phoneNumberId}`, {
                    params: { fields: 'id,display_phone_number,verified_name,status,quality_rating' },
                    headers: { Authorization: `Bearer ${cfg.accessToken}` },
                }),
                axios_1.default.get(`${WA_BASE_URL}/${cfg.wabaId}`, {
                    params: { fields: 'id,name,currency,timezone_id,message_template_namespace' },
                    headers: { Authorization: `Bearer ${cfg.accessToken}` },
                }),
            ]);
            return { valida: true, stats: { phone: phoneRes.data, waba: wabaRes.data }, mensaje: 'OK' };
        }
        catch (err) {
            return { valida: false, mensaje: err?.response?.data?.error?.message || 'Error' };
        }
    }
};
WhatsappService = WhatsappService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [configuracion_cliente_service_1.ConfiguracionClienteService])
], WhatsappService);
exports.WhatsappService = WhatsappService;
//# sourceMappingURL=whatsapp.service.js.map