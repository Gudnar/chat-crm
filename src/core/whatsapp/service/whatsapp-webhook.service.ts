import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import { WhatsappService } from './whatsapp.service'
import { ConversacionService } from '../../conversacion/service/conversacion.service'
import { AgenteService } from '../../agente/service/agente.service'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'
import { HerramientaService } from '../../herramienta/service/herramienta.service'
import { ToolExecutorService } from '../../herramienta/service/tool-executor.service'
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

      const { respuesta, imagenes } = await this.llamarClaude(agente, historial, clienteId, conversacion.id)
      if (!respuesta) return

      await this.conversacionService.agregarMensaje(conversacion.id, { role: 'assistant', content: respuesta })
      await this.agenteService.incrementarContadores(agente.id, 1)
      await this.waService.enviarTexto(from, respuesta, config)

      // Enviar imágenes de productos encontrados después del texto
      for (const imageUrl of imagenes) {
        await this.waService.enviarImagen(from, imageUrl, '', config)
      }

      this.logger.log(`[WA] Respuesta enviada a ${from} (${imagenes.length} imágenes adjuntas)`)
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
      return { respuesta: null, imagenes: [] }
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

    try {
      for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
        const body: any = {
          model: agente.modelo || 'claude-haiku-4-5',
          max_tokens: agente.maxTokens || 256,
          system: systemPrompt,
          messages,
        }
        if (tools.length > 0) body.tools = tools

        const res = await axios.post(ANTHROPIC_API, body, { headers })
        const { stop_reason, content } = res.data

        if (stop_reason === 'end_turn') {
          const textBlock = content.find((b: any) => b.type === 'text')
          return { respuesta: textBlock?.text ?? null, imagenes: pendingImages }
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

            toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: resultado.texto })
          }

          messages.push({ role: 'user', content: toolResults })
          continue
        }

        const textBlock = (content as any[])?.find((b: any) => b.type === 'text')
        return { respuesta: textBlock?.text ?? null, imagenes: pendingImages }
      }

      this.logger.warn('[WA] Se alcanzó el límite de iteraciones de tool_use')
      return { respuesta: null, imagenes: [] }
    } catch (err: any) {
      this.logger.error(`[WA] Error llamando a Claude: ${err?.response?.data?.error?.message || err.message}`)
      return { respuesta: null, imagenes: [] }
    }
  }
}
