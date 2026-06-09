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
var RedSocialWebhookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedSocialWebhookService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const red_social_service_1 = require("./red-social.service");
const conversacion_service_1 = require("../../conversacion/service/conversacion.service");
const agente_service_1 = require("../../agente/service/agente.service");
const configuracion_cliente_service_1 = require("../../cliente/service/configuracion-cliente.service");
const constants_1 = require("../../../common/constants");
const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MAX_HISTORY = 20;
let RedSocialWebhookService = RedSocialWebhookService_1 = class RedSocialWebhookService {
    constructor(redSocialService, conversacionService, agenteService, confClienteService) {
        this.redSocialService = redSocialService;
        this.conversacionService = conversacionService;
        this.agenteService = agenteService;
        this.confClienteService = confClienteService;
        this.logger = new common_1.Logger(RedSocialWebhookService_1.name);
    }
    async procesarEventoInstagram(entry) {
        const igAccountId = entry.id;
        const cuenta = await this.redSocialService.resolverCuentaPorPageId(igAccountId);
        if (!cuenta || !cuenta.enabled) {
            this.logger.warn(`[IG] Cuenta no encontrada o inactiva para pageId: ${igAccountId}`);
            return;
        }
        for (const msg of entry.messaging || []) {
            if (msg.message && !msg.message.is_echo) {
                await this.procesarDM(msg.sender?.id, msg.sender?.id, msg.message.text || '', 'instagram', cuenta).catch(e => this.logger.error(`[IG] DM error: ${e.message}`));
            }
        }
        for (const change of entry.changes || []) {
            if (change.field === 'comments' && change.value) {
                await this.procesarComentarioIG(change.value, cuenta)
                    .catch(e => this.logger.error(`[IG] Comment error: ${e.message}`));
            }
        }
    }
    async procesarEventoFacebook(entry) {
        const pageId = entry.id;
        const cuenta = await this.redSocialService.resolverCuentaPorPageId(pageId);
        if (!cuenta || !cuenta.enabled) {
            this.logger.warn(`[FB] Cuenta no encontrada o inactiva para pageId: ${pageId}`);
            return;
        }
        for (const msg of entry.messaging || []) {
            if (msg.message && !msg.message.is_echo) {
                await this.procesarDM(msg.sender?.id, msg.sender?.id, msg.message.text || '', 'facebook', cuenta).catch(e => this.logger.error(`[FB] DM error: ${e.message}`));
            }
        }
        for (const change of entry.changes || []) {
            if (change.field === 'feed' && change.value?.item === 'comment') {
                await this.procesarComentarioFB(change.value, cuenta)
                    .catch(e => this.logger.error(`[FB] Feed comment error: ${e.message}`));
            }
        }
    }
    async procesarDM(senderId, contacto, texto, plataforma, cuenta) {
        if (!texto.trim())
            return;
        if (!cuenta.agenteId) {
            this.logger.warn(`[${plataforma.toUpperCase()}] Sin agente asignado a la cuenta ${cuenta.id}`);
            return;
        }
        this.logger.log(`[${plataforma.toUpperCase()}] DM de ${senderId}: "${texto.slice(0, 80)}"`);
        const agente = await this.agenteService.obtener(cuenta.agenteId, cuenta.clienteId);
        if (!agente?.activo)
            return;
        const conversacion = await this.encontrarOCrearConversacion(contacto, agente.id, plataforma, cuenta.clienteId);
        await this.conversacionService.agregarMensaje(conversacion.id, { role: 'user', content: texto });
        const actualizada = await this.conversacionService.obtener(conversacion.id);
        const historial = (actualizada.mensajes || [])
            .slice(-MAX_HISTORY)
            .map(m => ({ role: m.role, content: m.content }));
        const respuesta = await this.llamarClaude(agente, historial, cuenta.clienteId);
        if (!respuesta)
            return;
        await this.conversacionService.agregarMensaje(conversacion.id, { role: 'assistant', content: respuesta });
        await this.agenteService.incrementarContadores(agente.id);
        const cuentaCompleta = await this.redSocialService.obtenerCuentaRaw(cuenta.id, cuenta.clienteId);
        if (cuentaCompleta?.accessToken) {
            try {
                await this.redSocialService.enviarMensajeDM(senderId, respuesta, cuentaCompleta.accessToken);
                this.logger.log(`[${plataforma.toUpperCase()}] Respuesta DM enviada a ${senderId}`);
            }
            catch (e) {
                this.logger.error(`[${plataforma.toUpperCase()}] Error enviando DM: ${e.message}`);
            }
        }
    }
    async procesarComentarioIG(value, cuenta) {
        const commentId = value.id;
        const texto = value.text;
        const postId = value.media?.id;
        if (!texto?.trim())
            return;
        this.logger.log(`[IG] Comentario en post ${postId}: "${texto.slice(0, 80)}"`);
        const agenteId = await this.resolverAgenteParaPost(postId, cuenta);
        if (!agenteId)
            return;
        const agente = await this.agenteService.obtener(agenteId, cuenta.clienteId);
        if (!agente?.activo)
            return;
        const respuesta = await this.llamarClaudeUnico(agente, texto, cuenta.clienteId);
        if (!respuesta)
            return;
        const cuentaCompleta = await this.redSocialService.obtenerCuentaRaw(cuenta.id, cuenta.clienteId);
        if (cuentaCompleta?.accessToken && commentId) {
            try {
                await this.redSocialService.responderComentarioIG(commentId, respuesta, cuentaCompleta.accessToken);
                this.logger.log(`[IG] Respuesta a comentario ${commentId} enviada`);
            }
            catch (e) {
                this.logger.error(`[IG] Error respondiendo comentario: ${e.message}`);
            }
        }
    }
    async procesarComentarioFB(value, cuenta) {
        const commentId = value.comment_id;
        const texto = value.message;
        const postId = value.post_id;
        const fromId = value.from?.id || value.sender_id || commentId;
        const fromName = value.from?.name || 'Usuario Facebook';
        if (!texto?.trim())
            return;
        this.logger.log(`[FB] Comentario de ${fromName} en post ${postId}: "${texto.slice(0, 80)}"`);
        const agenteId = await this.resolverAgenteParaPost(postId, cuenta);
        if (!agenteId)
            return;
        const agente = await this.agenteService.obtener(agenteId, cuenta.clienteId);
        if (!agente?.activo)
            return;
        const contactoKey = `fb_comment_${postId}_${fromId}`;
        const conversacion = await this.encontrarOCrearConversacion(contactoKey, agente.id, 'facebook', cuenta.clienteId);
        await this.conversacionService.agregarMensaje(conversacion.id, {
            role: 'user',
            content: `[Comentario de ${fromName}]: ${texto}`,
        });
        const actualizada = await this.conversacionService.obtener(conversacion.id);
        const historial = (actualizada.mensajes || [])
            .slice(-MAX_HISTORY)
            .map(m => ({ role: m.role, content: m.content }));
        const respuesta = await this.llamarClaude(agente, historial, cuenta.clienteId);
        if (!respuesta)
            return;
        await this.conversacionService.agregarMensaje(conversacion.id, { role: 'assistant', content: respuesta });
        await this.agenteService.incrementarContadores(agente.id);
        const cuentaCompleta = await this.redSocialService.obtenerCuentaRaw(cuenta.id, cuenta.clienteId);
        if (cuentaCompleta?.accessToken && commentId) {
            try {
                await this.redSocialService.responderComentarioFB(commentId, respuesta, cuentaCompleta.accessToken);
                this.logger.log(`[FB] Respuesta a comentario ${commentId} enviada`);
            }
            catch (e) {
                this.logger.error(`[FB] Error respondiendo comentario: ${e.message}`);
            }
        }
    }
    async importarComentariosComoConversaciones(postId, clienteId) {
        const post = await this.redSocialService.obtenerPost(postId, clienteId);
        if (!post?.comentariosData?.length)
            return { importados: 0 };
        const cuenta = await this.redSocialService.obtenerCuentaRaw(post.cuentaId || '', post.clienteId);
        const agenteId = post.agenteId || cuenta?.agenteId;
        if (!agenteId)
            return { importados: 0 };
        let importados = 0;
        for (const cm of post.comentariosData) {
            const contactoKey = `fb_comment_${post.postId}_${cm.fromId}`;
            const conversacion = await this.encontrarOCrearConversacion(contactoKey, agenteId, 'facebook', post.clienteId);
            const existente = await this.conversacionService.obtener(conversacion.id);
            if (!existente.mensajes?.length) {
                await this.conversacionService.agregarMensaje(conversacion.id, {
                    role: 'user',
                    content: `[Comentario de ${cm.fromName}]: ${cm.message}`,
                });
                importados++;
            }
        }
        return { importados };
    }
    async resolverAgenteParaPost(postId, cuenta) {
        if (postId) {
            const postEntry = await this.redSocialService.resolverPostPorPostId(postId, cuenta.clienteId);
            if (postEntry?.agenteId)
                return postEntry.agenteId;
        }
        return cuenta.agenteId || null;
    }
    async encontrarOCrearConversacion(contacto, agenteId, canal, clienteId) {
        const existentes = await this.conversacionService.listar(clienteId, agenteId);
        const delContacto = existentes.filter(c => c.contacto === contacto && c.canal === canal);
        const abierta = delContacto.find(c => c.estadoConversacion !== 'resuelto' && c.estadoConversacion !== 'cerrado');
        if (abierta)
            return abierta;
        const cerrada = delContacto[0];
        if (cerrada) {
            await this.conversacionService.actualizarEstado(cerrada.id, 'abierto');
            return { ...cerrada, estadoConversacion: 'abierto' };
        }
        return this.conversacionService.crear({ agenteId, contacto, canal, etiquetas: [] }, constants_1.USUARIO_SISTEMA, clienteId);
    }
    async llamarClaude(agente, mensajes, clienteId) {
        const apiKey = await this.obtenerApiKey(clienteId);
        if (!apiKey)
            return null;
        try {
            const systemPrompt = agente.systemPrompt ||
                `Eres ${agente.nombre}, un asistente IA ${agente.tono || 'profesional'}. Responde en ${agente.idioma || 'español'} de forma concisa y útil.`;
            const res = await axios_1.default.post(ANTHROPIC_API, {
                model: agente.modelo || 'claude-haiku-4-5',
                max_tokens: agente.maxTokens || 256,
                system: systemPrompt,
                messages: mensajes,
            }, {
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                },
            });
            return res.data?.content?.[0]?.text || null;
        }
        catch (err) {
            this.logger.error(`[RS] Claude error: ${err?.response?.data?.error?.message || err.message}`);
            return null;
        }
    }
    async llamarClaudeUnico(agente, texto, clienteId) {
        return this.llamarClaude(agente, [{ role: 'user', content: texto }], clienteId);
    }
    async obtenerApiKey(clienteId) {
        const cfg = await this.confClienteService.obtenerPorClave(clienteId, 'ANTHROPIC_API_KEY');
        const key = cfg?.valor;
        if (!key || key.includes('•')) {
            this.logger.error('[RS] ANTHROPIC_API_KEY no configurada');
            return null;
        }
        return key;
    }
};
RedSocialWebhookService = RedSocialWebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [red_social_service_1.RedSocialService,
        conversacion_service_1.ConversacionService,
        agente_service_1.AgenteService,
        configuracion_cliente_service_1.ConfiguracionClienteService])
], RedSocialWebhookService);
exports.RedSocialWebhookService = RedSocialWebhookService;
//# sourceMappingURL=red-social-webhook.service.js.map