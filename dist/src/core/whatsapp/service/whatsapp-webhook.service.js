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
var WhatsappWebhookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappWebhookService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const whatsapp_service_1 = require("./whatsapp.service");
const conversacion_service_1 = require("../../conversacion/service/conversacion.service");
const agente_service_1 = require("../../agente/service/agente.service");
const configuracion_cliente_service_1 = require("../../cliente/service/configuracion-cliente.service");
const herramienta_service_1 = require("../../herramienta/service/herramienta.service");
const tool_executor_service_1 = require("../../herramienta/service/tool-executor.service");
const base_conocimiento_service_1 = require("../../base-conocimiento/service/base-conocimiento.service");
const constants_1 = require("../../../common/constants");
const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MAX_HISTORY_MESSAGES = 20;
const MAX_TOOL_ITERATIONS = 5;
let WhatsappWebhookService = WhatsappWebhookService_1 = class WhatsappWebhookService {
    constructor(waService, conversacionService, agenteService, confClienteService, herramientaService, toolExecutor, baseConocimientoService) {
        this.waService = waService;
        this.conversacionService = conversacionService;
        this.agenteService = agenteService;
        this.confClienteService = confClienteService;
        this.herramientaService = herramientaService;
        this.toolExecutor = toolExecutor;
        this.baseConocimientoService = baseConocimientoService;
        this.logger = new common_1.Logger(WhatsappWebhookService_1.name);
    }
    async procesarMensajeEntrante(rawMessage, contactName, phoneNumberId) {
        const textoUsuario = this.extraerTexto(rawMessage);
        if (!textoUsuario) {
            this.logger.log(`[WA] Tipo no soportado: ${rawMessage.type} — ignorado`);
            return;
        }
        const from = rawMessage.from;
        const clienteId = await this.confClienteService.resolverClientePorPhoneNumberId(phoneNumberId);
        if (!clienteId) {
            this.logger.warn(`[WA] No se encontró cliente para phoneNumberId: ${phoneNumberId}`);
            return;
        }
        this.logger.log(`[WA] Mensaje de ${from} (${contactName}) → cliente ${clienteId}: "${textoUsuario.slice(0, 80)}"`);
        try {
            const config = await this.waService.obtenerConfig(clienteId);
            if (!config.enabled) {
                this.logger.warn('[WA] Canal desactivado, mensaje ignorado');
                return;
            }
            this.waService.marcarLeido(rawMessage.id, config).catch(() => { });
            this.waService.mostrarTyping(rawMessage.id, config).catch(() => { });
            if (!config.agenteId) {
                this.logger.warn('[WA] No hay agente asignado al canal WhatsApp');
                return;
            }
            const agente = await this.agenteService.obtener(config.agenteId, clienteId);
            if (!agente || !agente.activo) {
                this.logger.warn(`[WA] Agente ${config.agenteId} inactivo o no encontrado`);
                return;
            }
            const conversacion = await this.encontrarOCrearConversacion(from, contactName, agente.id, clienteId);
            await this.conversacionService.agregarMensaje(conversacion.id, { role: 'user', content: textoUsuario });
            const convActualizada = await this.conversacionService.obtener(conversacion.id);
            const historial = (convActualizada.mensajes || [])
                .slice(-MAX_HISTORY_MESSAGES)
                .map(m => ({ role: m.role, content: m.content }));
            const { respuesta, imagenes } = await this.llamarClaude(agente, historial, clienteId, conversacion.id);
            if (!respuesta)
                return;
            await this.conversacionService.agregarMensaje(conversacion.id, { role: 'assistant', content: respuesta });
            await this.agenteService.incrementarContadores(agente.id, 1);
            await this.waService.enviarTexto(from, respuesta, config);
            for (const imageUrl of imagenes) {
                await this.waService.enviarImagen(from, imageUrl, '', config);
            }
            this.logger.log(`[WA] Respuesta enviada a ${from} (${imagenes.length} imágenes adjuntas)`);
        }
        catch (err) {
            this.logger.error(`[WA] Error procesando mensaje de ${from}: ${err.message}`);
        }
    }
    extraerTexto(msg) {
        if (msg.type === 'text')
            return msg.text?.body || null;
        if (msg.type === 'button')
            return msg.button?.text || null;
        if (msg.type === 'interactive') {
            return msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || null;
        }
        return null;
    }
    async encontrarOCrearConversacion(from, contactName, agenteId, clienteId) {
        const existentes = await this.conversacionService.listar(clienteId, agenteId);
        const delContacto = existentes.filter(c => c.contacto === from && c.canal === 'whatsapp');
        const abierta = delContacto.find(c => c.estadoConversacion !== 'resuelto' && c.estadoConversacion !== 'cerrado');
        if (abierta)
            return abierta;
        const cerrada = delContacto[0];
        if (cerrada) {
            await this.conversacionService.actualizarEstado(cerrada.id, 'abierto');
            this.logger.log(`[WA] Conversación ${cerrada.id} reabierta para ${from}`);
            return { ...cerrada, estadoConversacion: 'abierto' };
        }
        return this.conversacionService.crear({
            agenteId,
            contacto: from,
            canal: 'whatsapp',
            etiquetas: [],
            notas: contactName !== from ? `Nombre: ${contactName}` : undefined,
        }, constants_1.USUARIO_SISTEMA, clienteId);
    }
    async llamarClaude(agente, mensajes, clienteId, conversacionId) {
        const apiKeyConfig = await this.confClienteService.obtenerPorClave(clienteId, 'ANTHROPIC_API_KEY');
        const apiKey = apiKeyConfig?.valor;
        if (!apiKey || apiKey.includes('•')) {
            this.logger.error('[WA] ANTHROPIC_API_KEY no configurada para este cliente');
            return { respuesta: null, imagenes: [] };
        }
        const instrucciones = agente.systemPrompt ||
            `Eres ${agente.nombre}, un asistente IA ${agente.tono || 'profesional'}. Responde en ${agente.idioma || 'español'} de forma concisa y útil.`;
        const faqContexto = await this.baseConocimientoService.construirContexto(agente.id);
        const systemPrompt = faqContexto ? `${instrucciones}\n\n${faqContexto}` : instrucciones;
        const herramientas = await this.herramientaService.listarPorAgente(agente.id);
        const tools = this.herramientaService.convertirAFormatoClaudeTools(herramientas);
        const headers = {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
        };
        const messages = mensajes.map(m => ({ role: m.role, content: m.content }));
        const pendingImages = [];
        try {
            for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
                const body = {
                    model: agente.modelo || 'claude-haiku-4-5',
                    max_tokens: agente.maxTokens || 256,
                    system: systemPrompt,
                    messages,
                };
                if (tools.length > 0)
                    body.tools = tools;
                const res = await axios_1.default.post(ANTHROPIC_API, body, { headers });
                const { stop_reason, content } = res.data;
                if (stop_reason === 'end_turn') {
                    const textBlock = content.find((b) => b.type === 'text');
                    return { respuesta: textBlock?.text ?? null, imagenes: pendingImages };
                }
                if (stop_reason === 'tool_use') {
                    messages.push({ role: 'assistant', content });
                    const toolResults = [];
                    for (const block of content) {
                        if (block.type !== 'tool_use')
                            continue;
                        this.logger.log(`[WA] Tool use: ${block.name} input=${JSON.stringify(block.input)}`);
                        const resultado = await this.toolExecutor.ejecutar(block.name, block.input, { conversacionId, clienteId, agenteId: agente.id });
                        if (resultado.imagenes?.length) {
                            pendingImages.push(...resultado.imagenes);
                        }
                        toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: resultado.texto });
                    }
                    messages.push({ role: 'user', content: toolResults });
                    continue;
                }
                const textBlock = content?.find((b) => b.type === 'text');
                return { respuesta: textBlock?.text ?? null, imagenes: pendingImages };
            }
            this.logger.warn('[WA] Se alcanzó el límite de iteraciones de tool_use');
            return { respuesta: null, imagenes: [] };
        }
        catch (err) {
            this.logger.error(`[WA] Error llamando a Claude: ${err?.response?.data?.error?.message || err.message}`);
            return { respuesta: null, imagenes: [] };
        }
    }
};
WhatsappWebhookService = WhatsappWebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService,
        conversacion_service_1.ConversacionService,
        agente_service_1.AgenteService,
        configuracion_cliente_service_1.ConfiguracionClienteService,
        herramienta_service_1.HerramientaService,
        tool_executor_service_1.ToolExecutorService,
        base_conocimiento_service_1.BaseConocimientoService])
], WhatsappWebhookService);
exports.WhatsappWebhookService = WhatsappWebhookService;
//# sourceMappingURL=whatsapp-webhook.service.js.map