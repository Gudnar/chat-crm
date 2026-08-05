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
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
const path_1 = require("path");
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
    constructor(waService, conversacionService, agenteService, confClienteService, herramientaService, toolExecutor, baseConocimientoService, configService) {
        this.waService = waService;
        this.conversacionService = conversacionService;
        this.agenteService = agenteService;
        this.confClienteService = confClienteService;
        this.herramientaService = herramientaService;
        this.toolExecutor = toolExecutor;
        this.baseConocimientoService = baseConocimientoService;
        this.configService = configService;
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
            let adjunto;
            if (this.esMensajeConAdjunto(rawMessage)) {
                adjunto = (await this.descargarYGuardarAdjunto(rawMessage, config)) ?? undefined;
            }
            const ubicacion = this.extraerUbicacion(rawMessage);
            const respuestaFlow = this.extraerRespuestaFlow(rawMessage);
            await this.conversacionService.agregarMensaje(conversacion.id, { role: 'user', content: textoUsuario, adjunto, ubicacion, respuestaFlow });
            if (agente.tipoAgente === constants_1.TipoAgente.HUMANO) {
                await this.conversacionService.asignarAgenteHumano(conversacion.id, agente.id);
                this.logger.log(`[WA] Mensaje de ${from} guardado para el agente humano ${agente.nombre} — sin respuesta automática`);
                return;
            }
            const convActualizada = await this.conversacionService.obtener(conversacion.id);
            const historial = (convActualizada.mensajes || [])
                .slice(-MAX_HISTORY_MESSAGES)
                .map(m => ({ role: m.role, content: m.content }));
            const { respuesta, textosPrevios, imagenes, documentos, audios, videos, opciones, botonesLink, solicitudesUbicacion, flows } = await this.llamarClaude(agente, historial, clienteId, conversacion.id);
            if (!respuesta && textosPrevios.length === 0)
                return;
            for (const texto of textosPrevios) {
                await this.conversacionService.agregarMensaje(conversacion.id, { role: 'assistant', content: texto });
                await this.waService.enviarTexto(from, texto, config);
            }
            if (respuesta) {
                await this.conversacionService.agregarMensaje(conversacion.id, { role: 'assistant', content: respuesta });
                await this.waService.enviarTexto(from, respuesta, config);
            }
            await this.agenteService.incrementarContadores(agente.id, 1);
            for (const imageUrl of imagenes) {
                await this.waService.enviarImagen(from, imageUrl, '', config);
            }
            for (const doc of documentos) {
                await this.waService.enviarDocumento(from, doc.url, doc.filename, '', config);
            }
            for (const audioUrl of audios) {
                await this.waService.enviarAudio(from, audioUrl, config);
            }
            for (const videoUrl of videos) {
                await this.waService.enviarVideo(from, videoUrl, '', config);
            }
            for (const pregunta of opciones) {
                if (pregunta.botones.length <= 3) {
                    await this.waService.enviarBotones(from, pregunta.pregunta, pregunta.botones, config);
                }
                else {
                    await this.waService.enviarLista(from, pregunta.pregunta, 'Ver opciones', pregunta.botones, config);
                }
                await this.conversacionService.agregarMensaje(conversacion.id, {
                    role: 'assistant',
                    content: pregunta.pregunta,
                    interactivo: pregunta,
                });
            }
            for (const link of botonesLink) {
                await this.waService.enviarBotonLink(from, link.mensaje, link.textoBoton, link.url, config);
                await this.conversacionService.agregarMensaje(conversacion.id, {
                    role: 'assistant',
                    content: link.mensaje,
                    enlace: { texto: link.textoBoton, url: link.url },
                });
            }
            for (const solicitud of solicitudesUbicacion) {
                await this.waService.enviarSolicitudUbicacion(from, solicitud.mensaje, config);
                await this.conversacionService.agregarMensaje(conversacion.id, {
                    role: 'assistant',
                    content: solicitud.mensaje,
                    pidioUbicacion: true,
                });
            }
            for (const flow of flows) {
                await this.waService.enviarFlow(from, flow.metaFlowId, flow.flowToken, flow.cta, flow.mensaje, flow.screenId, config);
                await this.conversacionService.agregarMensaje(conversacion.id, {
                    role: 'assistant',
                    content: flow.mensaje,
                    flow: { metaFlowId: flow.metaFlowId, flowToken: flow.flowToken, cta: flow.cta },
                });
            }
            this.logger.log(`[WA] Respuesta enviada a ${from} (${imagenes.length} imágenes, ${documentos.length} documentos, ${audios.length} audios, ${videos.length} videos, ${opciones.length} preguntas con opciones, ${botonesLink.length} botones link, ${solicitudesUbicacion.length} solicitudes de ubicación, ${flows.length} flows)`);
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
            if (msg.interactive?.type === 'nfm_reply') {
                const respuestaFlow = this.extraerRespuestaFlow(msg);
                if (!respuestaFlow)
                    return '[Formulario completado, pero no se pudo leer el contenido]';
                const resumen = Object.entries(respuestaFlow.respuestas).map(([campo, valor]) => `${campo}: ${valor}`).join(', ');
                return `[Formulario "${respuestaFlow.nombre}" completado: ${resumen}]`;
            }
            return msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || null;
        }
        if (msg.type === 'image')
            return msg.image?.caption || '[Imagen adjunta]';
        if (msg.type === 'document')
            return msg.document?.caption || `[Documento adjunto: ${msg.document?.filename || 'archivo'}]`;
        if (msg.type === 'audio')
            return '[Nota de voz / audio adjunto]';
        if (msg.type === 'location' && msg.location) {
            const { latitude, longitude, name } = msg.location;
            return `[Ubicación compartida: ${latitude}, ${longitude}${name ? ` — ${name}` : ''}]`;
        }
        return null;
    }
    extraerUbicacion(msg) {
        if (msg.type !== 'location' || !msg.location)
            return undefined;
        return {
            latitud: msg.location.latitude,
            longitud: msg.location.longitude,
            nombre: msg.location.name,
            direccion: msg.location.address,
        };
    }
    extraerRespuestaFlow(msg) {
        const nfm = msg.interactive?.nfm_reply;
        if (msg.type !== 'interactive' || msg.interactive?.type !== 'nfm_reply' || !nfm)
            return undefined;
        try {
            const datos = JSON.parse(nfm.response_json || '{}');
            const { flow_token: _flowToken, ...respuestas } = datos;
            return { nombre: nfm.name || 'formulario', respuestas };
        }
        catch {
            return undefined;
        }
    }
    esMensajeConAdjunto(msg) {
        return msg.type === 'image' || msg.type === 'document' || msg.type === 'audio';
    }
    async descargarYGuardarAdjunto(msg, config) {
        const media = msg.image || msg.document || msg.audio;
        if (!media)
            return null;
        try {
            const { buffer, mimeType } = await this.waService.descargarMedia(media.id, config);
            const ext = this.extensionDesdeMime(mimeType, msg.type);
            const filename = `${Date.now()}-${media.id}${ext}`;
            const dir = (0, path_1.join)(process.cwd(), 'uploads', 'whatsapp-adjuntos');
            if (!(0, fs_1.existsSync)(dir))
                (0, fs_1.mkdirSync)(dir, { recursive: true });
            (0, fs_1.writeFileSync)((0, path_1.join)(dir, filename), buffer);
            const appUrl = (this.configService.get('APP_URL') || 'http://localhost:3001').replace(/\/$/, '');
            return {
                url: `${appUrl}/uploads/whatsapp-adjuntos/${filename}`,
                tipo: msg.type,
                nombre: msg.type === 'document' ? (msg.document?.filename || filename) : undefined,
            };
        }
        catch (err) {
            this.logger.error(`[WA] No se pudo descargar adjunto (${media.id}): ${err.message}`);
            return null;
        }
    }
    extensionDesdeMime(mimeType, tipoMsg) {
        const base = (mimeType || '').split(';')[0].trim();
        const mapa = {
            'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp',
            'application/pdf': '.pdf',
            'audio/ogg': '.ogg', 'audio/mpeg': '.mp3', 'audio/amr': '.amr', 'audio/aac': '.aac',
        };
        return mapa[base] || (tipoMsg === 'document' ? '' : '.bin');
    }
    async encontrarOCrearConversacion(from, contactName, agenteId, clienteId) {
        const existentes = await this.conversacionService.listar(clienteId);
        const delContacto = existentes.filter(c => c.contacto === from && c.canal === 'whatsapp');
        const abierta = delContacto.find(c => c.estadoConversacion !== 'resuelto' && c.estadoConversacion !== 'cerrado');
        if (abierta) {
            if (abierta.agenteId !== agenteId)
                await this.conversacionService.actualizarAgente(abierta.id, agenteId);
            return { ...abierta, agenteId };
        }
        const cerrada = delContacto[0];
        if (cerrada) {
            await this.conversacionService.actualizarEstado(cerrada.id, 'abierto');
            if (cerrada.agenteId !== agenteId)
                await this.conversacionService.actualizarAgente(cerrada.id, agenteId);
            this.logger.log(`[WA] Conversación ${cerrada.id} reabierta para ${from}`);
            return { ...cerrada, estadoConversacion: 'abierto', agenteId };
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
            return { respuesta: null, textosPrevios: [], imagenes: [], documentos: [], audios: [], videos: [], opciones: [], botonesLink: [], solicitudesUbicacion: [], flows: [] };
        }
        const instrucciones = agente.systemPrompt ||
            `Eres ${agente.nombre}, un asistente IA ${agente.tono || 'profesional'}. Responde en ${agente.idioma || 'español'} de forma concisa y útil.`;
        const fechaActual = `[Fecha y hora actual: ${new Date().toLocaleString('es-BO', {
            timeZone: 'America/La_Paz',
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
        })}]`;
        const faqContexto = await this.baseConocimientoService.construirContexto(agente.id);
        const systemPrompt = faqContexto ? `${fechaActual}\n\n${instrucciones}\n\n${faqContexto}` : `${fechaActual}\n\n${instrucciones}`;
        const cacheDisabledConfig = await this.confClienteService.obtenerPorClave(clienteId, 'ANTHROPIC_CACHE_DISABLED');
        const cacheDisabled = cacheDisabledConfig?.valor?.toLowerCase() === 'true';
        const herramientas = await this.herramientaService.listarPorAgente(agente.id);
        const tools = this.herramientaService.convertirAFormatoClaudeTools(herramientas);
        const headers = {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
        };
        const messages = mensajes.map(m => ({ role: m.role, content: m.content }));
        const pendingImages = [];
        const pendingDocs = [];
        const pendingAudios = [];
        const pendingVideos = [];
        const pendingOpciones = [];
        const pendingBotonesLink = [];
        const pendingSolicitudesUbicacion = [];
        const pendingFlows = [];
        const textosPrevios = [];
        const herramientasEjecutadas = new Set();
        let reintentoConfirmacionForzado = false;
        try {
            const maxTokens = tools.length > 0
                ? Math.max(Number(agente.maxTokens) || 0, 700)
                : (Number(agente.maxTokens) || 256);
            for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
                const systemBlock = cacheDisabled
                    ? { type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }
                    : { type: 'text', text: systemPrompt };
                const body = {
                    model: agente.modelo || 'claude-haiku-4-5',
                    max_tokens: maxTokens,
                    system: [systemBlock],
                    messages,
                };
                if (tools.length > 0)
                    body.tools = tools;
                const res = await axios_1.default.post(ANTHROPIC_API, body, { headers });
                const { stop_reason, content } = res.data;
                if (stop_reason === 'max_tokens') {
                    this.logger.warn(`[WA] Respuesta cortada por max_tokens (${maxTokens}) — considere aumentar maxTokens del agente ${agente.id}`);
                }
                if (stop_reason === 'end_turn') {
                    const textBlock = content.find((b) => b.type === 'text' && b.text?.trim());
                    if (!textBlock && i < MAX_TOOL_ITERATIONS - 1) {
                        this.logger.warn('[WA] end_turn sin texto — se pide al modelo redactar la respuesta');
                        const nudge = { type: 'text', text: '[Sistema: las acciones fueron registradas. Escribe AHORA tu respuesta de texto para el cliente.]' };
                        const ultimo = messages[messages.length - 1];
                        if (ultimo?.role === 'user') {
                            if (Array.isArray(ultimo.content))
                                ultimo.content.push(nudge);
                            else
                                ultimo.content = [{ type: 'text', text: ultimo.content }, nudge];
                        }
                        continue;
                    }
                    const pareceConfirmarCita = /anotad[oa]/i.test(textBlock?.text ?? '');
                    const tieneAgendarCita = tools.some(t => t.name === 'agendar_cita');
                    if (pareceConfirmarCita && tieneAgendarCita && !herramientasEjecutadas.has('agendar_cita') && !reintentoConfirmacionForzado) {
                        reintentoConfirmacionForzado = true;
                        this.logger.warn('[WA] Texto de confirmación de cita sin ejecutar agendar_cita — forzando reintento');
                        const nudge = {
                            type: 'text',
                            text: '[Sistema: escribiste una confirmación de cita ("Anotado...") pero NO ejecutaste agendar_cita en este turno. Ejecuta la herramienta agendar_cita AHORA con la fecha/hora que el cliente dio, y luego redacta tu respuesta.]',
                        };
                        messages.push({ role: 'assistant', content });
                        messages.push({ role: 'user', content: [nudge] });
                        continue;
                    }
                    if (pareceConfirmarCita && tieneAgendarCita && !herramientasEjecutadas.has('agendar_cita')) {
                        this.logger.error(`[WA] POSIBLE CITA FANTASMA: el agente ${agente.id} confirmó una cita en texto sin ejecutar agendar_cita (conversación ${conversacionId})`);
                    }
                    return { respuesta: this.sanitizarRespuesta(textBlock?.text ?? null, tools), textosPrevios, imagenes: pendingImages, documentos: pendingDocs, audios: pendingAudios, videos: pendingVideos, opciones: pendingOpciones, botonesLink: pendingBotonesLink, solicitudesUbicacion: pendingSolicitudesUbicacion, flows: pendingFlows };
                }
                if (stop_reason === 'tool_use') {
                    messages.push({ role: 'assistant', content });
                    for (const block of content) {
                        if (block.type === 'text' && block.text?.trim()) {
                            const limpio = this.sanitizarRespuesta(block.text, tools);
                            if (limpio)
                                textosPrevios.push(limpio);
                        }
                    }
                    const toolResults = [];
                    for (const block of content) {
                        if (block.type !== 'tool_use')
                            continue;
                        herramientasEjecutadas.add(block.name);
                        this.logger.log(`[WA] Tool use: ${block.name} input=${JSON.stringify(block.input)}`);
                        const resultado = await this.toolExecutor.ejecutar(block.name, block.input, { conversacionId, clienteId, agenteId: agente.id });
                        if (resultado.imagenes?.length) {
                            pendingImages.push(...resultado.imagenes);
                        }
                        if (resultado.documentos?.length) {
                            pendingDocs.push(...resultado.documentos);
                        }
                        if (resultado.audios?.length) {
                            pendingAudios.push(...resultado.audios);
                        }
                        if (resultado.videos?.length) {
                            pendingVideos.push(...resultado.videos);
                        }
                        if (resultado.opciones) {
                            pendingOpciones.push(resultado.opciones);
                        }
                        if (resultado.botonLink) {
                            pendingBotonesLink.push(resultado.botonLink);
                        }
                        if (resultado.solicitudUbicacion) {
                            pendingSolicitudesUbicacion.push(resultado.solicitudUbicacion);
                        }
                        if (resultado.flow) {
                            pendingFlows.push(resultado.flow);
                        }
                        toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: resultado.texto });
                    }
                    messages.push({ role: 'user', content: toolResults });
                    continue;
                }
                const textBlock = content?.find((b) => b.type === 'text');
                return { respuesta: this.sanitizarRespuesta(textBlock?.text ?? null, tools), textosPrevios, imagenes: pendingImages, documentos: pendingDocs, audios: pendingAudios, videos: pendingVideos, opciones: pendingOpciones, botonesLink: pendingBotonesLink, solicitudesUbicacion: pendingSolicitudesUbicacion, flows: pendingFlows };
            }
            this.logger.warn('[WA] Se alcanzó el límite de iteraciones de tool_use');
            return { respuesta: null, textosPrevios, imagenes: pendingImages, documentos: pendingDocs, audios: pendingAudios, videos: pendingVideos, opciones: pendingOpciones, botonesLink: pendingBotonesLink, solicitudesUbicacion: pendingSolicitudesUbicacion, flows: pendingFlows };
        }
        catch (err) {
            this.logger.error(`[WA] Error llamando a Claude: ${err?.response?.data?.error?.message || err.message}`);
            return { respuesta: null, textosPrevios, imagenes: [], documentos: [], audios: [], videos: [], opciones: [], botonesLink: [], solicitudesUbicacion: [], flows: [] };
        }
    }
    sanitizarRespuesta(texto, tools) {
        if (!texto)
            return texto;
        let limpio = texto;
        limpio = limpio.replace(/\[\s*Sistema:[^\]]*\]/gi, '');
        const nombres = tools
            .map(t => t.name)
            .filter(Boolean)
            .map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        if (nombres.length) {
            const re = new RegExp(`\`?\\b(?:${nombres.join('|')})\\s*\\([^)]*\\)\`?`, 'g');
            const antes = limpio;
            limpio = limpio.replace(re, '');
            if (limpio !== antes) {
                this.logger.warn('[WA] Se filtró una fuga de sintaxis de herramienta en la respuesta al cliente');
            }
        }
        limpio = limpio.replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
        return limpio || null;
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
        base_conocimiento_service_1.BaseConocimientoService,
        config_1.ConfigService])
], WhatsappWebhookService);
exports.WhatsappWebhookService = WhatsappWebhookService;
//# sourceMappingURL=whatsapp-webhook.service.js.map