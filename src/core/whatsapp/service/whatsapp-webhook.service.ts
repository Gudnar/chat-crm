import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { WhatsappService, WaConfig } from './whatsapp.service'
import { ConversacionService } from '../../conversacion/service/conversacion.service'
import { AgenteService } from '../../agente/service/agente.service'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'
import { HerramientaService } from '../../herramienta/service/herramienta.service'
import { ToolExecutorService, ToolDocumento, ToolOpciones, ToolBotonLink, ToolSolicitudUbicacion, ToolFlow } from '../../herramienta/service/tool-executor.service'
import { BaseConocimientoService } from '../../base-conocimiento/service/base-conocimiento.service'
import { TranscripcionAudioService } from './transcripcion-audio.service'
import { WaWebhookMessage } from '../dto/whatsapp.dto'
import { USUARIO_SISTEMA, TipoAgente } from '../../../common/constants'
import { baseUrlAssets } from '../../../common/lib/url-assets.util'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const MAX_HISTORY_MESSAGES = 20
const MAX_TOOL_ITERATIONS = 5

type ClaudeMessage = {
  role: 'user' | 'assistant'
  content: string | any[]
}

interface LlamarClaudeResult {
  respuesta: string | null
  textosPrevios: string[]
  imagenes: string[]
  documentos: ToolDocumento[]
  audios: string[]
  videos: string[]
  opciones: ToolOpciones[]
  botonesLink: ToolBotonLink[]
  solicitudesUbicacion: ToolSolicitudUbicacion[]
  flows: ToolFlow[]
}

@Injectable()
export class WhatsappWebhookService {
  private readonly logger = new Logger(WhatsappWebhookService.name)

  constructor(
    private readonly waService: WhatsappService,
    private readonly conversacionService: ConversacionService,
    private readonly agenteService: AgenteService,
    private readonly confClienteService: ConfiguracionClienteService,
    private readonly herramientaService: HerramientaService,
    private readonly toolExecutor: ToolExecutorService,
    private readonly baseConocimientoService: BaseConocimientoService,
    private readonly transcripcionService: TranscripcionAudioService,
  ) {}

  // ── Main entry point ─────────────────────────────────────────

  async procesarMensajeEntrante(
    rawMessage: WaWebhookMessage,
    contactName: string,
    phoneNumberId: string,
  ): Promise<void> {
    const textoExtraido = this.extraerTexto(rawMessage)
    if (!textoExtraido) {
      this.logger.log(`[WA] Tipo no soportado: ${rawMessage.type} — ignorado`)
      return
    }

    // Detecta de dónde vino el contacto (anuncio Click-to-WhatsApp o un link propio
    // etiquetado manualmente) y limpia cualquier tag de tracking del texto ANTES de
    // que se persista o llegue a Claude — el cliente/el modelo nunca deben verlo.
    const origen = this.extraerOrigen(rawMessage, textoExtraido)
    const textoUsuario = origen.textoLimpio

    const from = rawMessage.from

    const clienteId = await this.confClienteService.resolverClientePorPhoneNumberId(phoneNumberId)
    if (!clienteId) {
      this.logger.warn(`[WA] No se encontró cliente para phoneNumberId: ${phoneNumberId}`)
      return
    }

    this.logger.log(`[WA] Mensaje de ${from} (${contactName}) → cliente ${clienteId}: "${textoUsuario.slice(0, 80)}"`)

    try {
      const config = await this.waService.obtenerConfig(clienteId)
      if (!config.enabled) {
        this.logger.warn('[WA] Canal desactivado, mensaje ignorado')
        return
      }

      this.waService.marcarLeido(rawMessage.id, config).catch(() => {})
      this.waService.mostrarTyping(rawMessage.id, config).catch(() => {})

      if (!config.agenteId) {
        this.logger.warn('[WA] No hay agente asignado al canal WhatsApp')
        return
      }

      const agente = await this.agenteService.obtener(config.agenteId, clienteId)
      if (!agente || !agente.activo) {
        this.logger.warn(`[WA] Agente ${config.agenteId} inactivo o no encontrado`)
        return
      }

      const conversacion = await this.encontrarOCrearConversacion(from, contactName, agente.id, clienteId, origen)

      let adjunto: { url: string; tipo: string; nombre?: string; buffer: Buffer; mimeType: string } | undefined
      if (this.esMensajeConAdjunto(rawMessage)) {
        adjunto = (await this.descargarYGuardarAdjunto(rawMessage, config)) ?? undefined
      }

      let textoFinal = textoUsuario
      if (rawMessage.type === 'audio' && agente.transcribirAudios && adjunto?.buffer) {
        const transcripcion = await this.transcripcionService.transcribir(adjunto.buffer, adjunto.mimeType, clienteId)
        if (transcripcion) textoFinal = transcripcion
      }

      const ubicacion = this.extraerUbicacion(rawMessage)
      const respuestaFlow = this.extraerRespuestaFlow(rawMessage)
      const adjuntoPersistible = adjunto ? { url: adjunto.url, tipo: adjunto.tipo, nombre: adjunto.nombre } : undefined
      await this.conversacionService.agregarMensaje(conversacion.id, {
        role: 'user',
        content: textoFinal,
        adjunto: adjuntoPersistible,
        ubicacion,
        respuestaFlow,
      })

      // Canal atendido directamente por una persona del equipo (no un agente IA):
      // el mensaje queda guardado y asignado para que el humano responda desde el
      // panel. Claude nunca debe intervenir ni auto-responder suplantando a alguien
      // real — sin esto, llamarClaude() usa el prompt genérico de fallback y contesta
      // "soy [nombre], un asistente IA", lo cual es incorrecto y confunde al cliente.
      if (agente.tipoAgente === TipoAgente.HUMANO) {
        await this.conversacionService.asignarAgenteHumano(conversacion.id, agente.id)
        this.logger.log(`[WA] Mensaje de ${from} guardado para el agente humano ${agente.nombre} — sin respuesta automática`)
        return
      }

      const convActualizada = await this.conversacionService.obtener(conversacion.id)
      const historial = (convActualizada.mensajes || [])
        .slice(-MAX_HISTORY_MESSAGES)
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

      const { respuesta, textosPrevios, imagenes, documentos, audios, videos, opciones, botonesLink, solicitudesUbicacion, flows } = await this.llamarClaude(agente, historial, clienteId, conversacion.id)
      // No hay nada que mandar solo si NINGÚN campo trae contenido. Antes solo se
      // chequeaba respuesta/textosPrevios — con el filtro de saludos duplicados,
      // preguntar_opciones puede llegar acá con textosPrevios vacío (el saludo
      // suelto se descartó a propósito) y solo opciones con contenido; con el chequeo
      // viejo esa respuesta se perdía entera y el cliente no recibía nada.
      const hayAlgoQueEnviar = respuesta || textosPrevios.length > 0 || imagenes.length > 0 ||
        documentos.length > 0 || audios.length > 0 || videos.length > 0 || opciones.length > 0 ||
        botonesLink.length > 0 || solicitudesUbicacion.length > 0 || flows.length > 0
      if (!hayAlgoQueEnviar) return

      // Texto escrito por Claude ANTES de invocar una tool (ej. el checklist previo
      // al envío del catálogo) — debe llegar al cliente antes que el recurso adjunto.
      for (const texto of textosPrevios) {
        await this.conversacionService.agregarMensaje(conversacion.id, { role: 'assistant', content: texto })
        await this.waService.enviarTexto(from, texto, config)
      }

      if (respuesta) {
        await this.conversacionService.agregarMensaje(conversacion.id, { role: 'assistant', content: respuesta })
        await this.waService.enviarTexto(from, respuesta, config)
      }
      await this.agenteService.incrementarContadores(agente.id, 1)

      // Enviar imágenes de productos encontrados después del texto
      for (const imageUrl of imagenes) {
        await this.waService.enviarImagen(from, imageUrl, '', config)
      }

      // Enviar documentos (catálogo PDF, fichas técnicas) después del texto
      for (const doc of documentos) {
        await this.waService.enviarDocumento(from, doc.url, doc.filename, '', config)
      }

      // Enviar audios/videos de recursos encontrados después del texto
      for (const audioUrl of audios) {
        await this.waService.enviarAudio(from, audioUrl, config)
      }
      for (const videoUrl of videos) {
        await this.waService.enviarVideo(from, videoUrl, '', config)
      }

      // Preguntas con botones/lista (herramienta preguntar_opciones) — se mandan al
      // final, después del texto, y quedan guardadas en el historial para que se vean
      // en el panel igual que cualquier otro mensaje del agente.
      for (const pregunta of opciones) {
        if (pregunta.botones.length <= 3) {
          await this.waService.enviarBotones(from, pregunta.pregunta, pregunta.botones, config)
        } else {
          await this.waService.enviarLista(from, pregunta.pregunta, 'Ver opciones', pregunta.botones, config)
        }
        await this.conversacionService.agregarMensaje(conversacion.id, {
          role: 'assistant',
          content: pregunta.pregunta,
          interactivo: pregunta,
        })
      }

      // Botones con link externo (herramienta enviar_boton_link)
      for (const link of botonesLink) {
        await this.waService.enviarBotonLink(from, link.mensaje, link.textoBoton, link.url, config)
        await this.conversacionService.agregarMensaje(conversacion.id, {
          role: 'assistant',
          content: link.mensaje,
          enlace: { texto: link.textoBoton, url: link.url },
        })
      }

      // Solicitudes de ubicación (herramienta solicitar_ubicacion)
      for (const solicitud of solicitudesUbicacion) {
        await this.waService.enviarSolicitudUbicacion(from, solicitud.mensaje, config)
        await this.conversacionService.agregarMensaje(conversacion.id, {
          role: 'assistant',
          content: solicitud.mensaje,
          pidioUbicacion: true,
        })
      }

      // Formularios nativos (herramienta iniciar_flow) — la respuesta llega después,
      // por webhook, como interactive.nfm_reply (ver extraerRespuestaFlow).
      for (const flow of flows) {
        await this.waService.enviarFlow(from, flow.metaFlowId, flow.flowToken, flow.cta, flow.mensaje, flow.screenId, config)
        await this.conversacionService.agregarMensaje(conversacion.id, {
          role: 'assistant',
          content: flow.mensaje,
          flow: { metaFlowId: flow.metaFlowId, flowToken: flow.flowToken, cta: flow.cta },
        })
      }

      this.logger.log(`[WA] Respuesta enviada a ${from} (${imagenes.length} imágenes, ${documentos.length} documentos, ${audios.length} audios, ${videos.length} videos, ${opciones.length} preguntas con opciones, ${botonesLink.length} botones link, ${solicitudesUbicacion.length} solicitudes de ubicación, ${flows.length} flows)`)
    } catch (err: any) {
      this.logger.error(`[WA] Error procesando mensaje de ${from}: ${err.message}`)
    }
  }

  // ── Helpers ──────────────────────────────────────────────────

  private extraerTexto(msg: WaWebhookMessage): string | null {
    if (msg.type === 'text') return msg.text?.body || null
    if (msg.type === 'button') return msg.button?.text || null
    if (msg.type === 'interactive') {
      if (msg.interactive?.type === 'nfm_reply') {
        const respuestaFlow = this.extraerRespuestaFlow(msg)
        if (!respuestaFlow) return '[Formulario completado, pero no se pudo leer el contenido]'
        const resumen = Object.entries(respuestaFlow.respuestas).map(([campo, valor]) => `${campo}: ${valor}`).join(', ')
        return `[Formulario "${respuestaFlow.nombre}" completado: ${resumen}]`
      }
      return msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || null
    }
    // Antes estos 3 tipos se descartaban en silencio: el cliente mandaba una foto,
    // un comprobante o una nota de voz y nunca quedaba ni un rastro en la plataforma.
    if (msg.type === 'image') return msg.image?.caption || '[Imagen adjunta]'
    if (msg.type === 'document') return msg.document?.caption || `[Documento adjunto: ${msg.document?.filename || 'archivo'}]`
    if (msg.type === 'audio') return '[Nota de voz / audio adjunto]'
    if (msg.type === 'location' && msg.location) {
      const { latitude, longitude, name } = msg.location
      return `[Ubicación compartida: ${latitude}, ${longitude}${name ? ` — ${name}` : ''}]`
    }
    return null
  }

  private extraerUbicacion(msg: WaWebhookMessage): { latitud: number; longitud: number; nombre?: string; direccion?: string } | undefined {
    if (msg.type !== 'location' || !msg.location) return undefined
    return {
      latitud: msg.location.latitude,
      longitud: msg.location.longitude,
      nombre: msg.location.name,
      direccion: msg.location.address,
    }
  }

  private extraerRespuestaFlow(msg: WaWebhookMessage): { nombre: string; respuestas: Record<string, string> } | undefined {
    const nfm = msg.interactive?.nfm_reply
    if (msg.type !== 'interactive' || msg.interactive?.type !== 'nfm_reply' || !nfm) return undefined
    try {
      const datos = JSON.parse(nfm.response_json || '{}')
      const { flow_token: _flowToken, ...respuestas } = datos
      return { nombre: nfm.name || 'formulario', respuestas }
    } catch {
      return undefined
    }
  }

  private esMensajeConAdjunto(msg: WaWebhookMessage): boolean {
    return msg.type === 'image' || msg.type === 'document' || msg.type === 'audio'
  }

  /** Descarga el adjunto real desde Meta y lo guarda en uploads/ para poder mostrarlo en el panel. */
  private async descargarYGuardarAdjunto(
    msg: WaWebhookMessage,
    config: WaConfig,
  ): Promise<{ url: string; tipo: string; nombre?: string; buffer: Buffer; mimeType: string } | null> {
    const media = msg.image || msg.document || msg.audio
    if (!media) return null

    try {
      const { buffer, mimeType } = await this.waService.descargarMedia(media.id, config)
      const ext = this.extensionDesdeMime(mimeType, msg.type)
      const filename = `${Date.now()}-${media.id}${ext}`
      const dir = join(process.cwd(), 'uploads', 'whatsapp-adjuntos')
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
      writeFileSync(join(dir, filename), buffer)

      return {
        url: `${baseUrlAssets()}/uploads/whatsapp-adjuntos/${filename}`,
        tipo: msg.type,
        nombre: msg.type === 'document' ? (msg.document?.filename || filename) : undefined,
        buffer,
        mimeType,
      }
    } catch (err: any) {
      this.logger.error(`[WA] No se pudo descargar adjunto (${media.id}): ${err.message}`)
      return null
    }
  }

  private extensionDesdeMime(mimeType: string, tipoMsg: string): string {
    const base = (mimeType || '').split(';')[0].trim()
    const mapa: Record<string, string> = {
      'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp',
      'application/pdf': '.pdf',
      'audio/ogg': '.ogg', 'audio/mpeg': '.mp3', 'audio/amr': '.amr', 'audio/aac': '.aac',
    }
    return mapa[base] || (tipoMsg === 'document' ? '' : '.bin')
  }

  private async encontrarOCrearConversacion(
    from: string,
    contactName: string,
    agenteId: string,
    clienteId: string,
    origen: { fuente: string | null; refId: string | null; detalle: Record<string, any> | null },
  ) {
    // Sin el filtro por agenteId: el historial de un contacto es continuo por
    // número + canal, independiente de qué agente esté configurado en el canal
    // en este momento. Filtrar por agenteId hacía que cada cambio de agente en
    // Configuración (ej. de IA a humano y viceversa) creara una conversación
    // nueva para el mismo contacto en vez de continuar la existente.
    const existentes = await this.conversacionService.listar(clienteId)
    const delContacto = existentes.filter(c => c.contacto === from && c.canal === 'whatsapp')

    const abierta = delContacto.find(c => c.estadoConversacion !== 'resuelto' && c.estadoConversacion !== 'cerrado')
    if (abierta) {
      if (abierta.agenteId !== agenteId) await this.conversacionService.actualizarAgente(abierta.id, agenteId)
      return { ...abierta, agenteId }
    }

    const cerrada = delContacto[0]
    if (cerrada) {
      await this.conversacionService.actualizarEstado(cerrada.id, 'abierto')
      if (cerrada.agenteId !== agenteId) await this.conversacionService.actualizarAgente(cerrada.id, agenteId)
      this.logger.log(`[WA] Conversación ${cerrada.id} reabierta para ${from}`)
      return { ...cerrada, estadoConversacion: 'abierto', agenteId }
    }

    return this.conversacionService.crear(
      {
        agenteId,
        contacto: from,
        canal: 'whatsapp',
        etiquetas: [],
        notas: contactName !== from ? `Nombre: ${contactName}` : undefined,
        origenFuente: origen.fuente ?? undefined,
        origenRefId: origen.refId ?? undefined,
        origenDetalle: origen.detalle ?? undefined,
      },
      USUARIO_SISTEMA,
      clienteId,
    )
  }

  /**
   * De dónde vino el contacto:
   *  1. `referral` en el webhook → clic real en un anuncio Click-to-WhatsApp de Meta.
   *  2. Un tag `[ref:algo]` en el texto del primer mensaje → link wa.me propio
   *     (bio, web, QR) etiquetado a mano. Se quita del texto antes de devolverlo.
   *  3. Ninguno de los dos → tráfico directo, sin origen identificable.
   */
  private extraerOrigen(
    rawMessage: WaWebhookMessage,
    texto: string,
  ): { fuente: string | null; refId: string | null; detalle: Record<string, any> | null; textoLimpio: string } {
    const referral = rawMessage.referral
    if (referral) {
      return {
        fuente: 'meta_ads',
        refId: referral.source_id || null,
        detalle: {
          headline: referral.headline,
          body: referral.body,
          sourceUrl: referral.source_url,
          sourceType: referral.source_type,
          mediaType: referral.media_type,
          ctwaClid: referral.ctwa_clid,
        },
        textoLimpio: texto,
      }
    }

    const match = texto.match(/\[ref:([a-z0-9_-]+)\]/i)
    if (match) {
      return {
        fuente: match[1].toLowerCase(),
        refId: null,
        detalle: {},
        textoLimpio: texto.replace(match[0], '').replace(/[ \t]{2,}/g, ' ').trim(),
      }
    }

    return { fuente: null, refId: null, detalle: null, textoLimpio: texto }
  }

  private async llamarClaude(
    agente: any,
    mensajes: Array<{ role: 'user' | 'assistant'; content: string }>,
    clienteId: string,
    conversacionId: string,
  ): Promise<LlamarClaudeResult> {
    const apiKeyConfig = await this.confClienteService.obtenerPorClave(clienteId, 'ANTHROPIC_API_KEY')
    const apiKey = apiKeyConfig?.valor
    if (!apiKey || apiKey.includes('•')) {
      this.logger.error('[WA] ANTHROPIC_API_KEY no configurada para este cliente')
      return { respuesta: null, textosPrevios: [], imagenes: [], documentos: [], audios: [], videos: [], opciones: [], botonesLink: [], solicitudesUbicacion: [], flows: [] }
    }

    // Construir system prompt: instrucciones del agente + base de conocimiento
    const instrucciones = agente.systemPrompt ||
      `Eres ${agente.nombre}, un asistente IA ${agente.tono || 'profesional'}. Responde en ${agente.idioma || 'español'} de forma concisa y útil.`

    // Sin esto, el modelo no tiene forma de saber qué día es "hoy" y no puede convertir
    // fechas relativas ("mañana", "el jueves") a un fecha_hora concreto para agendar_cita.
    // timeZone explícito es obligatorio: sin él, toLocaleString usa el timezone del
    // servidor (en producción, Europa/Contabo) en vez de la hora real de Bolivia —
    // esto llegó a mostrarle al modelo "sábado" cuando en Bolivia todavía era "viernes".
    const fechaActual = `[Fecha y hora actual: ${new Date().toLocaleString('es-BO', {
      timeZone: 'America/La_Paz',
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })}]`

    const faqContexto = await this.baseConocimientoService.construirContexto(agente.id)
    const systemPrompt = faqContexto ? `${fechaActual}\n\n${instrucciones}\n\n${faqContexto}` : `${fechaActual}\n\n${instrucciones}`

    // Verificar si el caché de Anthropic debe estar deshabilitado
    const cacheDisabledConfig = await this.confClienteService.obtenerPorClave(clienteId, 'ANTHROPIC_CACHE_DISABLED')
    const cacheDisabled = cacheDisabledConfig?.valor?.toLowerCase() === 'true'

    const herramientas = await this.herramientaService.listarPorAgente(agente.id)
    const tools = this.herramientaService.convertirAFormatoClaudeTools(herramientas)

    const headers = {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    }

    const messages: ClaudeMessage[] = mensajes.map(m => ({ role: m.role, content: m.content }))
    const pendingImages: string[] = []
    const pendingDocs: ToolDocumento[] = []
    const pendingAudios: string[] = []
    const pendingVideos: string[] = []
    const pendingOpciones: ToolOpciones[] = []
    const pendingBotonesLink: ToolBotonLink[] = []
    const pendingSolicitudesUbicacion: ToolSolicitudUbicacion[] = []
    const pendingFlows: ToolFlow[] = []
    const textosPrevios: string[] = []
    const herramientasEjecutadas = new Set<string>()
    let reintentoConfirmacionForzado = false

    try {
      // Con herramientas, un presupuesto bajo puede cortar la respuesta A MITAD de un
      // tool_use: la API descarta el bloque incompleto y solo llega el texto previo
      // ("un segundo...") sin ejecutar nada. Piso de 700 tokens cuando hay tools.
      const maxTokens = tools.length > 0
        ? Math.max(Number(agente.maxTokens) || 0, 700)
        : (Number(agente.maxTokens) || 256)

      for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
        const systemBlock = cacheDisabled
          ? { type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }
          : { type: 'text', text: systemPrompt }

        const body: any = {
          model: agente.modelo || 'claude-haiku-4-5',
          max_tokens: maxTokens,
          system: [systemBlock],
          messages,
        }
        if (tools.length > 0) body.tools = tools

        const res = await axios.post(ANTHROPIC_API, body, { headers })
        const { stop_reason, content } = res.data

        if (stop_reason === 'max_tokens') {
          this.logger.warn(`[WA] Respuesta cortada por max_tokens (${maxTokens}) — considere aumentar maxTokens del agente ${agente.id}`)
        }

        if (stop_reason === 'end_turn') {
          const textBlock = content.find((b: any) => b.type === 'text' && b.text?.trim())
          if (!textBlock && i < MAX_TOOL_ITERATIONS - 1) {
            // Turno "mudo": el modelo usó herramientas pero terminó sin escribir nada.
            // Sin este empujón, el cliente no recibiría ningún mensaje.
            this.logger.warn('[WA] end_turn sin texto — se pide al modelo redactar la respuesta')
            const nudge = { type: 'text', text: '[Sistema: las acciones fueron registradas. Escribe AHORA tu respuesta de texto para el cliente.]' }
            const ultimo: any = messages[messages.length - 1]
            if (ultimo?.role === 'user') {
              if (Array.isArray(ultimo.content)) ultimo.content.push(nudge)
              else ultimo.content = [{ type: 'text', text: ultimo.content }, nudge]
            }
            continue
          }

          // Red de seguridad: Haiku a veces escribe "Anotado: ..." (confirmando una cita)
          // sin haber ejecutado agendar_cita en este mismo ciclo — el cliente cree que
          // quedó agendado y en el sistema no existe ninguna reserva. Si el agente tiene
          // la tool disponible, el texto "confirma" pero la tool nunca corrió, forzamos
          // UN reintento explícito antes de dejarlo pasar.
          const pareceConfirmarCita = /anotad[oa]/i.test(textBlock?.text ?? '')
          const tieneAgendarCita = tools.some(t => t.name === 'agendar_cita')
          if (pareceConfirmarCita && tieneAgendarCita && !herramientasEjecutadas.has('agendar_cita') && !reintentoConfirmacionForzado) {
            reintentoConfirmacionForzado = true
            this.logger.warn('[WA] Texto de confirmación de cita sin ejecutar agendar_cita — forzando reintento')
            const nudge = {
              type: 'text',
              text: '[Sistema: escribiste una confirmación de cita ("Anotado...") pero NO ejecutaste agendar_cita en este turno. Ejecuta la herramienta agendar_cita AHORA con la fecha/hora que el cliente dio, y luego redacta tu respuesta.]',
            }
            messages.push({ role: 'assistant', content })
            messages.push({ role: 'user', content: [nudge] })
            continue
          }

          if (pareceConfirmarCita && tieneAgendarCita && !herramientasEjecutadas.has('agendar_cita')) {
            // Ya reintentamos una vez y sigue sin ejecutar la tool: lo dejamos pasar pero
            // queda registrado a volumen alto para seguimiento manual (posible cita fantasma).
            this.logger.error(`[WA] POSIBLE CITA FANTASMA: el agente ${agente.id} confirmó una cita en texto sin ejecutar agendar_cita (conversación ${conversacionId})`)
          }

          return { respuesta: this.sanitizarRespuesta(textBlock?.text ?? null, tools), textosPrevios, imagenes: pendingImages, documentos: pendingDocs, audios: pendingAudios, videos: pendingVideos, opciones: pendingOpciones, botonesLink: pendingBotonesLink, solicitudesUbicacion: pendingSolicitudesUbicacion, flows: pendingFlows }
        }

        if (stop_reason === 'tool_use') {
          messages.push({ role: 'assistant', content })

          // El modelo puede escribir texto (ej. el checklist de beneficios) en la MISMA
          // respuesta donde decide invocar una tool. Sin esto, ese texto se quedaba
          // solo en el historial interno y nunca llegaba al cliente de WhatsApp.
          // Se acumula aparte (no directo en textosPrevios) porque a veces ese texto es
          // el mismo saludo/pregunta que ya va dentro del cuerpo de preguntar_opciones /
          // solicitar_ubicacion / iniciar_flow — el filtro de duplicados de abajo lo
          // descarta en ese caso para no mandar el mismo mensaje dos veces seguidas.
          const textosEsteTurno: string[] = []
          for (const block of content as any[]) {
            if (block.type === 'text' && block.text?.trim()) {
              const limpio = this.sanitizarRespuesta(block.text, tools)
              if (limpio) textosEsteTurno.push(limpio)
            }
          }

          const toolResults: any[] = []
          let debePausarTurno = false
          const cuerposPausaEsteTurno: string[] = []
          for (const block of content as any[]) {
            if (block.type !== 'tool_use') continue

            herramientasEjecutadas.add(block.name)
            this.logger.log(`[WA] Tool use: ${block.name} input=${JSON.stringify(block.input)}`)
            const resultado = await this.toolExecutor.ejecutar(
              block.name,
              block.input,
              { conversacionId, clienteId, agenteId: agente.id },
            )

            if (resultado.imagenes?.length) {
              pendingImages.push(...resultado.imagenes)
            }

            if (resultado.documentos?.length) {
              pendingDocs.push(...resultado.documentos)
            }

            if (resultado.audios?.length) {
              pendingAudios.push(...resultado.audios)
            }

            if (resultado.videos?.length) {
              pendingVideos.push(...resultado.videos)
            }

            if (resultado.opciones) {
              pendingOpciones.push(resultado.opciones)
              cuerposPausaEsteTurno.push(resultado.opciones.pregunta)
              debePausarTurno = true
            }

            if (resultado.botonLink) {
              pendingBotonesLink.push(resultado.botonLink)
            }

            if (resultado.solicitudUbicacion) {
              pendingSolicitudesUbicacion.push(resultado.solicitudUbicacion)
              cuerposPausaEsteTurno.push(resultado.solicitudUbicacion.mensaje)
              debePausarTurno = true
            }

            if (resultado.flow) {
              pendingFlows.push(resultado.flow)
              cuerposPausaEsteTurno.push(resultado.flow.mensaje)
              debePausarTurno = true
            }

            toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: resultado.texto })
          }

          for (const texto of textosEsteTurno) {
            if (!this.esTextoDuplicadoDe(texto, cuerposPausaEsteTurno)) textosPrevios.push(texto)
          }

          // preguntar_opciones / solicitar_ubicacion / iniciar_flow le ceden el turno al
          // cliente: hay que esperar su respuesta, no darle al modelo otra iteración para
          // "hablar" (eso generaba saludos/textos duplicados antes de las opciones).
          if (debePausarTurno) {
            return { respuesta: null, textosPrevios, imagenes: pendingImages, documentos: pendingDocs, audios: pendingAudios, videos: pendingVideos, opciones: pendingOpciones, botonesLink: pendingBotonesLink, solicitudesUbicacion: pendingSolicitudesUbicacion, flows: pendingFlows }
          }

          messages.push({ role: 'user', content: toolResults })
          continue
        }

        const textBlock = (content as any[])?.find((b: any) => b.type === 'text')
        return { respuesta: this.sanitizarRespuesta(textBlock?.text ?? null, tools), textosPrevios, imagenes: pendingImages, documentos: pendingDocs, audios: pendingAudios, videos: pendingVideos, opciones: pendingOpciones, botonesLink: pendingBotonesLink, solicitudesUbicacion: pendingSolicitudesUbicacion, flows: pendingFlows }
      }

      this.logger.warn('[WA] Se alcanzó el límite de iteraciones de tool_use')
      return { respuesta: null, textosPrevios, imagenes: pendingImages, documentos: pendingDocs, audios: pendingAudios, videos: pendingVideos, opciones: pendingOpciones, botonesLink: pendingBotonesLink, solicitudesUbicacion: pendingSolicitudesUbicacion, flows: pendingFlows }
    } catch (err: any) {
      this.logger.error(`[WA] Error llamando a Claude: ${err?.response?.data?.error?.message || err.message}`)
      return { respuesta: null, textosPrevios, imagenes: [], documentos: [], audios: [], videos: [], opciones: [], botonesLink: [], solicitudesUbicacion: [], flows: [] }
    }
  }

  /**
   * Red de seguridad: elimina de la respuesta final cualquier fuga que jamás debe
   * llegar al cliente. Ocurre sobre todo con modelos rápidos (Haiku) que a veces
   * "escriben" la llamada a una herramienta como texto en lugar de invocarla.
   *
   * Solo filtra:
   *  1. Bloques internos `[Sistema: ...]` (nudges que nunca son para el cliente).
   *  2. Sintaxis de llamada de las herramientas REALES del agente, p. ej.
   *     `buscar_producto("Geely")` o `escalar_agente({ ... })`. Se usan los nombres
   *     exactos de las tools en contexto, así nunca se toca texto legítimo.
   */
  private sanitizarRespuesta(texto: string | null, tools: Array<{ name: string }>): string | null {
    if (!texto) return texto
    let limpio = texto

    // 1. Bloques [Sistema: ...]
    limpio = limpio.replace(/\[\s*Sistema:[^\]]*\]/gi, '')

    // 2. Llamadas a herramientas escritas como texto (solo nombres reales del agente)
    const nombres = tools
      .map(t => t.name)
      .filter(Boolean)
      .map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    if (nombres.length) {
      const re = new RegExp(`\`?\\b(?:${nombres.join('|')})\\s*\\([^)]*\\)\`?`, 'g')
      const antes = limpio
      limpio = limpio.replace(re, '')
      if (limpio !== antes) {
        this.logger.warn('[WA] Se filtró una fuga de sintaxis de herramienta en la respuesta al cliente')
      }
    }

    // 3. Normalizar espacios y saltos sobrantes tras los recortes
    limpio = limpio.replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim()

    return limpio || null
  }

  private normalizarParaComparar(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Detecta si `texto` (un bloque de texto suelto que acompaña a un tool_use) es en
   * esencia el mismo mensaje que el cuerpo de una herramienta que pausa el turno
   * (pregunta de preguntar_opciones, mensaje de solicitar_ubicacion/iniciar_flow).
   * El caso real: el modelo saluda en un bloque de texto Y repite el mismo saludo
   * dentro del parámetro `pregunta`, y el cliente ve el saludo dos veces seguidas.
   */
  private esTextoDuplicadoDe(texto: string, cuerpos: string[]): boolean {
    const norm = this.normalizarParaComparar(texto)
    if (!norm) return false
    return cuerpos.some((cuerpo) => {
      if (!cuerpo) return false
      const normCuerpo = this.normalizarParaComparar(cuerpo)
      if (!normCuerpo) return false
      return norm === normCuerpo || normCuerpo.includes(norm) || norm.includes(normCuerpo)
    })
  }
}
