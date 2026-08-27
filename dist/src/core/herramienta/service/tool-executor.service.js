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
var ToolExecutorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolExecutorService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const path_1 = require("path");
const conversacion_service_1 = require("../../conversacion/service/conversacion.service");
const producto_service_1 = require("../../producto/service/producto.service");
const configuracion_cliente_service_1 = require("../../cliente/service/configuracion-cliente.service");
const recurso_service_1 = require("../../recurso/service/recurso.service");
const recurso_entity_1 = require("../../recurso/entity/recurso.entity");
const reservacion_service_1 = require("../../reservacion/service/reservacion.service");
const flow_whatsapp_service_1 = require("../../whatsapp/service/flow-whatsapp.service");
const tienda_publica_service_1 = require("../../tienda/service/tienda-publica.service");
const pedido_service_1 = require("../../sucursal/service/pedido.service");
const inventario_sucursal_service_1 = require("../../sucursal/service/inventario-sucursal.service");
const sucursal_service_1 = require("../../sucursal/service/sucursal.service");
const cliente_final_service_1 = require("../../sucursal/service/cliente-final.service");
const constants_1 = require("../../../common/constants");
const fecha_bolivia_util_1 = require("../../../common/lib/fecha-bolivia.util");
let ToolExecutorService = ToolExecutorService_1 = class ToolExecutorService {
    constructor(conversacionService, productoService, confClienteService, recursoService, reservacionService, flowWhatsappService, tiendaPublicaService, pedidoService, inventarioService, sucursalService, clienteFinalService, configService) {
        this.conversacionService = conversacionService;
        this.productoService = productoService;
        this.confClienteService = confClienteService;
        this.recursoService = recursoService;
        this.reservacionService = reservacionService;
        this.flowWhatsappService = flowWhatsappService;
        this.tiendaPublicaService = tiendaPublicaService;
        this.pedidoService = pedidoService;
        this.inventarioService = inventarioService;
        this.sucursalService = sucursalService;
        this.clienteFinalService = clienteFinalService;
        this.configService = configService;
        this.logger = new common_1.Logger(ToolExecutorService_1.name);
    }
    async ejecutar(nombre, input, contexto) {
        this.logger.log(`[Tool] ${nombre} → ${JSON.stringify(input)}`);
        try {
            switch (nombre) {
                case 'calificar_lead': return await this.calificarLead(input, contexto);
                case 'cambiar_estado': return await this.cambiarEstado(input, contexto);
                case 'escalar_agente': return await this.escalarAgente(input, contexto);
                case 'crear_nota': return await this.crearNota(input, contexto);
                case 'buscar_producto': return await this.buscarProducto(input, contexto);
                case 'enviar_catalogo': return await this.enviarCatalogo(input, contexto);
                case 'enviar_recurso': return await this.enviarRecurso(input, contexto);
                case 'agendar_cita': return await this.agendarCita(input, contexto);
                case 'consultar_disponibilidad': return await this.consultarDisponibilidad(input, contexto);
                case 'preguntar_opciones': return await this.preguntarOpciones(input, contexto);
                case 'enviar_boton_link': return await this.enviarBotonLink(input, contexto);
                case 'solicitar_ubicacion': return await this.solicitarUbicacion(input, contexto);
                case 'iniciar_flow': return await this.iniciarFlow(input, contexto);
                case 'reservar_producto': return await this.reservarProducto(input, contexto);
                case 'abrir_tienda': return await this.abrirTienda(input, contexto);
                case 'crear_pedido': return await this.crearPedido(input, contexto);
                case 'consultar_stock_sucursal': return await this.consultarStockSucursal(input, contexto);
                case 'consultar_estado_pedido': return await this.consultarEstadoPedido(input, contexto);
                default:
                    this.logger.warn(`[Tool] Herramienta desconocida: ${nombre}`);
                    return { texto: `Herramienta "${nombre}" no está implementada.` };
            }
        }
        catch (err) {
            this.logger.error(`[Tool] Error ejecutando ${nombre}: ${err.message}`);
            return { texto: `Error al ejecutar la herramienta: ${err.message}` };
        }
    }
    async calificarLead(input, ctx) {
        const score = Math.min(100, Math.max(0, Number(input.score) || 0));
        await this.conversacionService.actualizarScore(ctx.conversacionId, score);
        return { texto: `Lead calificado con score ${score}. Razón: ${input.razon ?? 'sin especificar'}` };
    }
    async cambiarEstado(input, ctx) {
        await this.conversacionService.actualizarEstado(ctx.conversacionId, input.estado);
        return { texto: `Estado de conversación actualizado a: ${input.estado}` };
    }
    async escalarAgente(input, ctx) {
        await this.conversacionService.escalar(ctx.conversacionId, input.razon);
        return { texto: `Conversación escalada a agente humano. Razón: ${input.razon}. Prioridad: ${input.prioridad ?? 'media'}` };
    }
    async preguntarOpciones(input, _ctx) {
        const pregunta = String(input?.pregunta || '').trim();
        const opcionesInput = Array.isArray(input?.opciones) ? input.opciones : [];
        if (!pregunta || opcionesInput.length < 2) {
            return { texto: '[Sistema: preguntar_opciones necesita una pregunta y al menos 2 opciones. No se envió nada.]' };
        }
        if (opcionesInput.length > 10) {
            return { texto: '[Sistema: máximo 10 opciones — es el límite de WhatsApp. Reduce la lista.]' };
        }
        const botones = opcionesInput.slice(0, 10).map((o, i) => ({
            id: `op_${i + 1}`,
            titulo: String(o?.texto || '').trim().slice(0, 24) || `Opción ${i + 1}`,
        }));
        return {
            texto: `[Sistema: se le presentaron ${botones.length} opciones al cliente (${botones.map(b => b.titulo).join(', ')}). Espera a que elija tocando un botón antes de continuar — no asumas ni inventes cuál seleccionó.]`,
            opciones: { pregunta, botones },
        };
    }
    async enviarBotonLink(input, _ctx) {
        const mensaje = String(input?.mensaje || '').trim();
        const textoBoton = String(input?.texto_boton || '').trim();
        const url = String(input?.url || '').trim();
        if (!mensaje || !textoBoton || !url) {
            return { texto: '[Sistema: enviar_boton_link necesita mensaje, texto_boton y url. No se envió nada.]' };
        }
        if (!/^https?:\/\//i.test(url)) {
            return { texto: '[Sistema: la url debe empezar con http:// o https://. No se envió nada.]' };
        }
        return {
            texto: `[Sistema: se le mandó al cliente un botón "${textoBoton}" que lleva a ${url}.]`,
            botonLink: { mensaje, textoBoton: textoBoton.slice(0, 20), url },
        };
    }
    async solicitarUbicacion(input, _ctx) {
        const mensaje = String(input?.mensaje || '').trim();
        if (!mensaje) {
            return { texto: '[Sistema: solicitar_ubicacion necesita un mensaje. No se envió nada.]' };
        }
        return {
            texto: '[Sistema: se le pidió al cliente que comparta su ubicación con el botón nativo de WhatsApp. Espera a que la mande — no inventes ni asumas dónde está.]',
            solicitudUbicacion: { mensaje },
        };
    }
    async iniciarFlow(input, ctx) {
        const mensaje = String(input?.mensaje || '').trim();
        const nombreFlow = String(input?.nombre_flow || '').trim().toLowerCase();
        if (!mensaje || !nombreFlow) {
            return { texto: '[Sistema: iniciar_flow necesita nombre_flow y mensaje. No se envió nada.]' };
        }
        const flows = await this.flowWhatsappService.listar(ctx.clienteId);
        const flow = flows.find(f => f.nombre === nombreFlow && f.estadoFlow === constants_1.EstadoFlowWhatsapp.PUBLICADO);
        if (!flow) {
            return { texto: `[Sistema: no existe un flow publicado con el nombre "${nombreFlow}". No se envió nada — avisale al cliente que hubo un problema y seguí por texto.]` };
        }
        return {
            texto: `[Sistema: se le mandó al cliente el formulario "${flow.nombre}". Espera a que lo complete y lo mande — no inventes ni asumas sus respuestas.]`,
            flow: {
                mensaje,
                metaFlowId: flow.metaFlowId,
                flowToken: `${ctx.conversacionId}-${Date.now()}`,
                cta: flow.cta,
                screenId: this.flowWhatsappService.obtenerScreenId(),
            },
        };
    }
    async abrirTienda(input, ctx) {
        const mensaje = String(input?.mensaje || '').trim() || 'Podés armar tu pedido directo desde acá 🛍️';
        const conversacion = await this.conversacionService.obtener(ctx.conversacionId).catch(() => null);
        const contactoTelefono = conversacion?.contacto;
        if (!contactoTelefono) {
            return { texto: '[Sistema: no se pudo resolver el contacto de esta conversación. No se abrió la tienda.]' };
        }
        const resultado = await this.tiendaPublicaService.abrirParaConversacion(ctx.clienteId, ctx.conversacionId, contactoTelefono);
        if (!resultado.ok) {
            return { texto: `[Sistema: ${resultado.error} No se envió nada — seguí atendiendo al cliente por texto normal.]` };
        }
        const frontendUrl = (this.configService.get('FRONTEND_URL') || 'http://localhost:8083').replace(/\/$/, '');
        const url = `${frontendUrl}/tienda/${resultado.slug}?s=${resultado.token}`;
        return {
            texto: `[Sistema: se le mandó al cliente el link de la tienda online. Espera a que arme y confirme su pedido — no inventes ni asumas qué eligió.]`,
            botonLink: { mensaje, textoBoton: 'Ver catálogo 🛍️', url },
        };
    }
    async crearNota(input, ctx) {
        await this.conversacionService.agregarNota(ctx.conversacionId, input.nota);
        return { texto: `Nota interna creada: ${input.nota}` };
    }
    async buscarProducto(input, ctx) {
        const productos = await this.productoService.buscar(ctx.clienteId, input.termino, input.categoria);
        let texto = this.productoService.formatearParaClaude(productos);
        const imagenes = productos
            .flatMap(p => this.productoService.resolverUrlsImagenes(p.imagenes || []))
            .slice(0, 3);
        if (productos.length > 0) {
            texto += imagenes.length
                ? `\n\n[Sistema: se adjuntaron ${imagenes.length} imagen(es) del producto al chat del cliente]`
                : '\n\n[Sistema: estos productos NO tienen imágenes cargadas — no se envió ninguna foto al cliente]';
        }
        return { texto, imagenes };
    }
    async reservarProducto(input, ctx) {
        const termino = String(input?.termino || '').trim();
        if (!termino) {
            return { texto: '[Sistema: reservar_producto necesita el término/nombre del producto. No se reservó nada.]' };
        }
        const resultado = await this.productoService.reservarUnidad(ctx.clienteId, termino);
        return { texto: resultado.ok ? `[Sistema: ${resultado.mensaje}]` : `[Sistema: no se pudo reservar — ${resultado.mensaje}]` };
    }
    async consultarDisponibilidad(input, ctx) {
        const nombreAgente = String(input?.agente || '').trim();
        const agenteIdLegado = String(input?.agente_id || '').trim();
        const fecha = String(input?.fecha || '').trim();
        const duracion = Number(input?.duracion_minutos) || 30;
        if (!fecha) {
            return { texto: '[Sistema: falta la fecha para consultar disponibilidad. No se consultó nada.]' };
        }
        try {
            if (nombreAgente) {
                const { agente, error } = await this.reservacionService.buscarHumanoPorNombre(ctx.clienteId, nombreAgente);
                if (error || !agente)
                    return { texto: `[Sistema: ${error}]` };
                const slots = await this.reservacionService.obtenerDisponibilidad(agente.id, ctx.clienteId, fecha, duracion);
                if (!slots.length)
                    return { texto: `[Sistema: ${agente.nombre} no tiene horarios disponibles el ${fecha}. Sugiere al cliente otra fecha, no inventes horarios.]` };
                return { texto: `[Sistema: horarios REALMENTE disponibles de ${agente.nombre} el ${fecha}: ${slots.join(', ')}. Ofrece solo estas opciones, nunca inventes otras.]` };
            }
            if (agenteIdLegado) {
                const slots = await this.reservacionService.obtenerDisponibilidad(agenteIdLegado, ctx.clienteId, fecha, duracion);
                if (!slots.length)
                    return { texto: `[Sistema: no hay horarios disponibles el ${fecha}. Sugiere al cliente otra fecha, no inventes horarios.]` };
                return { texto: `[Sistema: horarios REALMENTE disponibles el ${fecha}: ${slots.join(', ')}. Ofrece solo estas opciones al cliente, nunca inventes otras.]` };
            }
            const slots = await this.reservacionService.obtenerDisponibilidadEquipo(ctx.clienteId, fecha, duracion);
            if (!slots.length)
                return { texto: `[Sistema: no hay horarios disponibles el ${fecha} en el equipo. Sugiere al cliente otra fecha, no inventes horarios.]` };
            return { texto: `[Sistema: horarios REALMENTE disponibles el ${fecha} (equipo): ${slots.join(', ')}. Ofrece solo estas opciones al cliente, nunca inventes otras.]` };
        }
        catch (err) {
            this.logger.warn(`[Tool] consultar_disponibilidad falló: ${err.message}`);
            return { texto: `[Sistema: no se pudo consultar disponibilidad (${err.message}).]` };
        }
    }
    async agendarCita(input, ctx) {
        const fechaHora = String(input?.fecha_hora || '').trim().replace(' ', 'T');
        const titulo = String(input?.titulo || '').trim();
        const nombreAgente = String(input?.agente || '').trim();
        const agenteIdLegado = input?.agente_id ? String(input.agente_id) : '';
        if (!fechaHora || !titulo) {
            return { texto: '[Sistema: faltan fecha_hora o titulo para agendar la cita. No se creó ninguna reserva.]' };
        }
        const fechaInicio = (0, fecha_bolivia_util_1.fechaHoraBoliviaAUtc)(fechaHora);
        if (Number.isNaN(fechaInicio.getTime())) {
            return { texto: '[Sistema: fecha_hora inválida, no se pudo interpretar. No se creó ninguna reserva.]' };
        }
        const duracionMinutos = Number(input?.duracion_minutos) || 30;
        const fechaFin = new Date(fechaInicio.getTime() + duracionMinutos * 60000);
        let agenteObjetivoId = ctx.agenteId;
        let nombreAsignado = null;
        if (agenteIdLegado) {
            agenteObjetivoId = agenteIdLegado;
        }
        else if (nombreAgente) {
            const { agente, error } = await this.reservacionService.buscarHumanoPorNombre(ctx.clienteId, nombreAgente);
            if (error || !agente)
                return { texto: `[Sistema: ${error}]` };
            agenteObjetivoId = agente.id;
            nombreAsignado = agente.nombre;
        }
        else {
            const { agente, error } = await this.reservacionService.elegirHumanoDisponible(ctx.clienteId, fechaInicio, fechaFin);
            if (error)
                return { texto: `[Sistema: ${error}]` };
            if (agente) {
                agenteObjetivoId = agente.id;
                nombreAsignado = agente.nombre;
            }
        }
        try {
            const conversacion = await this.conversacionService.obtener(ctx.conversacionId);
            const reserva = await this.reservacionService.crear({
                agenteId: agenteObjetivoId,
                conversacionId: ctx.conversacionId,
                contactoNombre: conversacion?.contacto || 'Cliente WhatsApp',
                contactoTelefono: conversacion?.contacto,
                fechaInicio: fechaHora,
                duracionMinutos: input?.duracion_minutos ? duracionMinutos : undefined,
                titulo,
                descripcion: input?.notas,
            }, constants_1.USUARIO_SISTEMA, ctx.clienteId);
            const fechaLegible = new Date(reserva.fechaInicio).toLocaleString('es-BO', { timeZone: 'America/La_Paz', dateStyle: 'medium', timeStyle: 'short' });
            const conQuien = nombreAsignado ? ` con ${nombreAsignado}` : '';
            return {
                texto: `[Sistema: cita agendada con éxito${conQuien}, código ${reserva.codigoReserva}, para el ${fechaLegible}. Confírmaselo al cliente con naturalidad en una línea, mencionando el nombre de la persona si corresponde.]`,
            };
        }
        catch (err) {
            this.logger.warn(`[Tool] agendar_cita falló: ${err.message}`);
            return {
                texto: `[Sistema: no se pudo agendar la cita (${err.message}). Informa al cliente con honestidad y, si es un problema de horario, ofrece otra fecha/hora.]`,
            };
        }
    }
    async enviarCatalogo(_input, ctx) {
        const urlCfg = await this.confClienteService.obtenerPorClave(ctx.clienteId, 'CATALOGO_PDF_URL');
        const url = urlCfg?.valor?.trim();
        if (!url) {
            this.logger.warn(`[Tool] enviar_catalogo: cliente ${ctx.clienteId} no tiene CATALOGO_PDF_URL configurado`);
            return {
                texto: '[Sistema: NO hay catálogo PDF configurado y no se envió ningún archivo. Dilo con honestidad, nunca afirmes haberlo enviado. Ofrece mostrar opciones del catálogo o derivar a un asesor.]',
            };
        }
        const nombreCfg = await this.confClienteService.obtenerPorClave(ctx.clienteId, 'CATALOGO_PDF_NOMBRE');
        const filename = nombreCfg?.valor?.trim() || 'catalogo.pdf';
        return {
            texto: '[Sistema: el catálogo PDF fue adjuntado y enviado al cliente. Coméntalo con naturalidad en una línea y sigue la conversación.]',
            documentos: [{ url, filename }],
        };
    }
    async enviarRecurso(input, ctx) {
        const termino = String(input?.termino || '').trim();
        this.logger.log(`[enviarRecurso] START: termino="${termino}", clienteId=${ctx.clienteId}, agenteId=${ctx.agenteId}`);
        if (!termino) {
            return { texto: '[Sistema: falta el término de búsqueda para enviar_recurso. No se envió nada.]' };
        }
        try {
            this.logger.log(`[enviarRecurso] recursoService exists: ${!!this.recursoService}`);
            const encontrados = await this.recursoService.buscarPorKeywords(ctx.clienteId, termino);
            this.logger.log(`[enviarRecurso] buscarPorKeywords devolvió ${encontrados.length} resultado(s)`);
            const visibles = encontrados.filter(r => !r.agenteId || r.agenteId === ctx.agenteId);
            this.logger.log(`[enviarRecurso] después de filtrar por agente: ${visibles.length} visible(s)`);
            if (visibles.length === 0) {
                this.logger.warn(`[Tool] enviar_recurso: sin resultados para "${termino}" (cliente ${ctx.clienteId})`);
                return {
                    texto: `[Sistema: no se encontró ningún recurso para "${termino}". No hay archivo, no afirmes haberlo enviado. Pregunta al cliente qué necesita o intenta con otro término.]`,
                };
            }
            if (visibles.length > 1) {
                const nombres = visibles.slice(0, 5).map(r => `${r.nombre} (${r.tipo.toLowerCase()})`).join(', ');
                this.logger.log(`[enviarRecurso] múltiples resultados, no se envía nada automáticamente`);
                return {
                    texto: `[Sistema: hay ${visibles.length} recursos que coinciden con "${termino}": ${nombres}. No se envió ninguno para evitar confusión. Pide al cliente que precise cuál necesita, o vuelve a llamar la herramienta con un término más específico.]`,
                };
            }
            const recurso = visibles[0];
            this.logger.log(`[enviarRecurso] recurso encontrado: id=${recurso.id}, nombre="${recurso.nombre}", tipo=${recurso.tipo}, archivoLocal="${recurso.archivoLocal}"`);
            if (await this.conversacionService.yaSeEnvioRecurso(ctx.conversacionId, recurso.id)) {
                this.logger.log(`[enviarRecurso] "${recurso.nombre}" ya se había enviado antes en esta conversación — no se reenvía`);
                return {
                    texto: `[Sistema: "${recurso.nombre}" ya se envió antes en esta conversación. NO se volvió a adjuntar. Coméntalo con naturalidad (ej. "ya te lo había enviado arriba") sin decir que lo mandaste de nuevo.]`,
                };
            }
            const url = await this.recursoService.obtenerUrlPublica(recurso.id, ctx.clienteId);
            this.logger.log(`[enviarRecurso] obtenerUrlPublica devolvió: ${url}`);
            const filename = this.nombreArchivo(recurso);
            this.logger.log(`[enviarRecurso] nombreArchivo: ${filename}`);
            const confirmacion = `[Sistema: se adjuntó "${recurso.nombre}" (${recurso.tipo.toLowerCase()}) al chat del cliente. Coméntalo con naturalidad en una línea y sigue la conversación.]`;
            await this.conversacionService.marcarRecursoEnviado(ctx.conversacionId, recurso.id);
            switch (recurso.tipo) {
                case recurso_entity_1.TipoRecurso.PDF:
                    this.logger.log(`[enviarRecurso] enviando como PDF: ${url}`);
                    return { texto: confirmacion, documentos: [{ url, filename }] };
                case recurso_entity_1.TipoRecurso.IMAGEN:
                    this.logger.log(`[enviarRecurso] enviando como IMAGEN: ${url}`);
                    return { texto: confirmacion, imagenes: [url] };
                case recurso_entity_1.TipoRecurso.AUDIO:
                    this.logger.log(`[enviarRecurso] enviando como AUDIO: ${url}`);
                    return { texto: confirmacion, audios: [url] };
                case recurso_entity_1.TipoRecurso.VIDEO:
                    this.logger.log(`[enviarRecurso] enviando como VIDEO: ${url}`);
                    return { texto: confirmacion, videos: [url] };
                default:
                    this.logger.warn(`[enviarRecurso] tipo no soportado: ${recurso.tipo}`);
                    return { texto: `[Sistema: el recurso "${recurso.nombre}" tiene un tipo no soportado para envío automático.]` };
            }
        }
        catch (err) {
            this.logger.error(`[enviarRecurso] ERROR: ${err.message}`, err.stack);
            return { texto: `[Sistema: error interno al buscar recurso: ${err.message}]` };
        }
    }
    async crearPedido(input, ctx) {
        try {
            const items = Array.isArray(input?.items) ? input.items : [];
            const tipoEntrega = input?.tipoEntrega || 'recojo';
            const direccion = input?.direccion;
            const notas = input?.notas;
            if (!items.length) {
                return { texto: '[Sistema: crear_pedido necesita al menos 1 item. No se creó pedido.]' };
            }
            const conv = await this.conversacionService.obtener(ctx.conversacionId);
            const sucursales = await this.sucursalService.listar(ctx.clienteId, true);
            if (!sucursales.length) {
                return { texto: '[Sistema: no hay sucursales activas para crear el pedido.]' };
            }
            const sucursal = sucursales[0];
            let totalGeneral = 0;
            const itemsFormato = items.map((item) => {
                const cantidad = Number(item.cantidad) || 1;
                const precioUnitario = Number(item.precioUnitario) || 0;
                const itemSubtotal = cantidad * precioUnitario;
                totalGeneral += itemSubtotal;
                return {
                    productoId: `${item.nombre}`.toLowerCase(),
                    nombre: item.nombre,
                    cantidad,
                    precioUnitario,
                    subtotal: itemSubtotal,
                };
            });
            const total = totalGeneral;
            let clienteFinal = await this.clienteFinalService.buscarPorTelefono(ctx.clienteId, conv.contacto);
            if (!clienteFinal) {
                clienteFinal = await this.clienteFinalService.crear(ctx.clienteId, {
                    nombre: conv.contacto,
                    telefono: conv.contacto,
                    sucursalId: sucursal.id,
                }, constants_1.USUARIO_SISTEMA);
            }
            const pedido = await this.pedidoService.crear(ctx.clienteId, {
                sucursalId: sucursal.id,
                contactoTelefono: conv.contacto,
                clienteFinalId: clienteFinal.id,
                conversacionId: ctx.conversacionId,
                items: itemsFormato,
                subtotal: totalGeneral,
                descuento: 0,
                total,
                tipoEntrega: tipoEntrega,
                direccionEntrega: direccion ? { direccion } : undefined,
                notas,
            }, constants_1.USUARIO_SISTEMA);
            return { texto: `[Sistema: Pedido creado con código ${pedido.codigoPedido}. Comunícalo al cliente de manera natural.]` };
        }
        catch (err) {
            this.logger.error(`[crearPedido] ERROR: ${err.message}`);
            return { texto: `[Sistema: error al crear pedido: ${err.message}]` };
        }
    }
    async consultarStockSucursal(input, ctx) {
        try {
            const nombreProducto = String(input?.nombreProducto || '').trim();
            const nombreSucursal = String(input?.sucursal || '').trim();
            if (!nombreProducto || !nombreSucursal) {
                return { texto: '[Sistema: consultar_stock_sucursal necesita nombreProducto y sucursal.]' };
            }
            const sucursales = await this.sucursalService.listar(ctx.clienteId, true);
            const sucursal = sucursales.find(s => s.nombre.toLowerCase().includes(nombreSucursal.toLowerCase()) ||
                s.codigo.toUpperCase() === nombreSucursal.toUpperCase());
            if (!sucursal) {
                return { texto: `[Sistema: no encontré sucursal "${nombreSucursal}". Disponibles: ${sucursales.map(s => s.nombre).join(', ')}]` };
            }
            const inventarios = await this.inventarioService.listarPorSucursal(sucursal.id);
            const inventario = inventarios.find(inv => inv.productoId);
            if (!inventario) {
                return { texto: `No tengo stock de "${nombreProducto}" en la sucursal ${sucursal.nombre} registrado en nuestro sistema.` };
            }
            const stock = inventario.stock ?? -1;
            const disponibilidad = stock < 0 ? 'Stock ilimitado' : stock > 0 ? `${stock} unidades` : 'Sin stock';
            return { texto: `En ${sucursal.nombre}: ${disponibilidad} de "${nombreProducto}".` };
        }
        catch (err) {
            this.logger.error(`[consultarStockSucursal] ERROR: ${err.message}`);
            return { texto: `[Sistema: error al consultar stock: ${err.message}]` };
        }
    }
    async consultarEstadoPedido(input, ctx) {
        try {
            const codigoPedido = String(input?.codigoPedido || '').trim();
            if (!codigoPedido) {
                return { texto: '[Sistema: consultar_estado_pedido necesita codigoPedido (ej. "LPZ-00001").]' };
            }
            const pedido = await this.pedidoService.obtenerPorCodigo(codigoPedido, ctx.clienteId);
            const estadosLegibles = {
                'pendiente_confirmacion': 'Pendiente de confirmación',
                'confirmado': 'Confirmado',
                'en_preparacion': 'En preparación',
                'listo': 'Listo para retirar',
                'en_camino': 'En camino',
                'entregado': 'Entregado',
                'cancelado': 'Cancelado',
            };
            const estado = estadosLegibles[pedido.estadoPedido] || pedido.estadoPedido;
            return { texto: `Pedido ${codigoPedido}: ${estado}. Total: $${pedido.total}.` };
        }
        catch (err) {
            this.logger.error(`[consultarEstadoPedido] ERROR: ${err.message}`);
            return { texto: `No encontré el pedido ${input?.codigoPedido}. Verifica el código e intenta de nuevo.` };
        }
    }
    nombreArchivo(recurso) {
        let ext = '';
        if (recurso.archivoLocal) {
            ext = (0, path_1.extname)(recurso.archivoLocal);
        }
        else if (recurso.urlExterna) {
            try {
                ext = (0, path_1.extname)(new URL(recurso.urlExterna).pathname);
            }
            catch { }
        }
        const base = recurso.nombre.replace(/[\\/:*?"<>|]/g, '').trim() || 'archivo';
        return ext ? `${base}${ext}` : base;
    }
};
ToolExecutorService = ToolExecutorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(6, (0, common_1.Inject)((0, common_1.forwardRef)(() => tienda_publica_service_1.TiendaPublicaService))),
    __metadata("design:paramtypes", [conversacion_service_1.ConversacionService,
        producto_service_1.ProductoService,
        configuracion_cliente_service_1.ConfiguracionClienteService,
        recurso_service_1.RecursoService,
        reservacion_service_1.ReservacionService,
        flow_whatsapp_service_1.FlowWhatsappService,
        tienda_publica_service_1.TiendaPublicaService,
        pedido_service_1.PedidoService,
        inventario_sucursal_service_1.InventarioSucursalService,
        sucursal_service_1.SucursalService,
        cliente_final_service_1.ClienteFinalService,
        config_1.ConfigService])
], ToolExecutorService);
exports.ToolExecutorService = ToolExecutorService;
//# sourceMappingURL=tool-executor.service.js.map