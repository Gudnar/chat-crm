import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import { WhatsappService } from './whatsapp.service'
import { ConversacionService } from '../../conversacion/service/conversacion.service'
import { AgenteService } from '../../agente/service/agente.service'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'
import { HerramientaService } from '../../herramienta/service/herramienta.service'
import { ToolExecutorService, ToolDocumento } from '../../herramienta/service/tool-executor.service'
import { BaseConocimientoService } from '../../base-conocimiento/service/base-conocimiento.service'
import { WaWebhookMessage } from '../dto/whatsapp.dto'
import { USUARIO_SISTEMA } from '../../../common/constants'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const MAX_HISTORY_MESSAGES = 20
const MAX_TOOL_ITERATIONS = 5

type ClaudeMessage = {
  role: 'user' | 'assistant'
  content: string | any[]
}

interface LlamarClaudeResult {
  respuesta: string | null
  imagenes: string[]
  documentos: ToolDocumento[]
  audios: string[]
  videos: string[]
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
  ) {}

  // ── Main entry point ─────────────────────────────────────────

  async procesarMensajeEntrante(
    rawMessage: WaWebhookMessage,
    contactName: string,
    phoneNumberId: string,
  ): Promise<void> {
    const textoUsuario = this.extraerTexto(rawMessage)
    if (!textoUsuario) {
      this.logger.log(`[WA] Tipo no soportado: ${rawMessage.type} — ignorado`)
      return
    }

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

      const conversacion = await this.encontrarOCrearConversacion(from, contactName, agente.id, clienteId)

      await this.conversacionService.agregarMensaje(conversacion.id, { role: 'user', content: textoUsuario })

      const convActualizada = await this.conversacionService.obtener(conversacion.id)
      const historial = (convActualizada.mensajes || [])
        .slice(-MAX_HISTORY_MESSAGES)
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

      const { respuesta, imagenes, documentos, audios, videos } = await this.llamarClaude(agente, historial, clienteId, conversacion.id)
      if (!respuesta) return

      await this.conversacionService.agregarMensaje(conversacion.id, { role: 'assistant', content: respuesta })
      await this.agenteService.incrementarContadores(agente.id, 1)
      await this.waService.enviarTexto(from, respuesta, config)

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

      this.logger.log(`[WA] Respuesta enviada a ${from} (${imagenes.length} imágenes, ${documentos.length} documentos, ${audios.length} audios, ${videos.length} videos)`)
    } catch (err: any) {
      this.logger.error(`[WA] Error procesando mensaje de ${from}: ${err.message}`)
    }
  }

  // ── Helpers ──────────────────────────────────────────────────

  private extraerTexto(msg: WaWebhookMessage): string | null {
    if (msg.type === 'text') return msg.text?.body || null
    if (msg.type === 'button') return msg.button?.text || null
    if (msg.type === 'interactive') {
      return msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || null
    }
    return null
  }

  private async encontrarOCrearConversacion(from: string, contactName: string, agenteId: string, clienteId: string) {
    const existentes = await this.conversacionService.listar(clienteId, agenteId)
    const delContacto = existentes.filter(c => c.contacto === from && c.canal === 'whatsapp')

    const abierta = delContacto.find(c => c.estadoConversacion !== 'resuelto' && c.estadoConversacion !== 'cerrado')
    if (abierta) return abierta

    const cerrada = delContacto[0]
    if (cerrada) {
      await this.conversacionService.actualizarEstado(cerrada.id, 'abierto')
      this.logger.log(`[WA] Conversación ${cerrada.id} reabierta para ${from}`)
      return { ...cerrada, estadoConversacion: 'abierto' }
    }

    return this.conversacionService.crear(
      {
        agenteId,
        contacto: from,
        canal: 'whatsapp',
        etiquetas: [],
        notas: contactName !== from ? `Nombre: ${contactName}` : undefined,
      },
      USUARIO_SISTEMA,
      clienteId,
    )
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
      return { respuesta: null, imagenes: [], documentos: [], audios: [], videos: [] }
    }

    // Construir system prompt: instrucciones del agente + base de conocimiento
    const instrucciones = agente.systemPrompt ||
      `Eres ${agente.nombre}, un asistente IA ${agente.tono || 'profesional'}. Responde en ${agente.idioma || 'español'} de forma concisa y útil.`

    const faqContexto = await this.baseConocimientoService.construirContexto(agente.id)
    const systemPrompt = faqContexto ? `${instrucciones}\n\n${faqContexto}` : instrucciones

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

    try {
      // Con herramientas, un presupuesto bajo puede cortar la respuesta A MITAD de un
      // tool_use: la API descarta el bloque incompleto y solo llega el texto previo
      // ("un segundo...") sin ejecutar nada. Piso de 700 tokens cuando hay tools.
      const maxTokens = tools.length > 0
        ? Math.max(Number(agente.maxTokens) || 0, 700)
        : (Number(agente.maxTokens) || 256)

      for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
        const body: any = {
          model: agente.modelo || 'claude-haiku-4-5',
          max_tokens: maxTokens,
          system: systemPrompt,
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
          return { respuesta: this.sanitizarRespuesta(textBlock?.text ?? null, tools), imagenes: pendingImages, documentos: pendingDocs, audios: pendingAudios, videos: pendingVideos }
        }

        if (stop_reason === 'tool_use') {
          messages.push({ role: 'assistant', content })

          const toolResults: any[] = []
          for (const block of content as any[]) {
            if (block.type !== 'tool_use') continue

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

            toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: resultado.texto })
          }

          messages.push({ role: 'user', content: toolResults })
          continue
        }

        const textBlock = (content as any[])?.find((b: any) => b.type === 'text')
        return { respuesta: this.sanitizarRespuesta(textBlock?.text ?? null, tools), imagenes: pendingImages, documentos: pendingDocs, audios: pendingAudios, videos: pendingVideos }
      }

      this.logger.warn('[WA] Se alcanzó el límite de iteraciones de tool_use')
      return { respuesta: null, imagenes: [], documentos: [], audios: [], videos: [] }
    } catch (err: any) {
      this.logger.error(`[WA] Error llamando a Claude: ${err?.response?.data?.error?.message || err.message}`)
      return { respuesta: null, imagenes: [], documentos: [], audios: [], videos: [] }
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
}
