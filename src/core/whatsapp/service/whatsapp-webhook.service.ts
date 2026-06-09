import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import { WhatsappService, WaConfig } from './whatsapp.service'
import { ConversacionService } from '../../conversacion/service/conversacion.service'
import { AgenteService } from '../../agente/service/agente.service'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'
import { WaWebhookMessage } from '../dto/whatsapp.dto'
import { USUARIO_SISTEMA } from '../../../common/constants'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const MAX_HISTORY_MESSAGES = 20

@Injectable()
export class WhatsappWebhookService {
  private readonly logger = new Logger(WhatsappWebhookService.name)

  constructor(
    private readonly waService: WhatsappService,
    private readonly conversacionService: ConversacionService,
    private readonly agenteService: AgenteService,
    private readonly confClienteService: ConfiguracionClienteService,
  ) {}

  // ── Main entry point called by controller ────────────────────

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

    // Resolver el cliente a partir del phoneNumberId
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

      const respuestaIA = await this.llamarClaude(agente, historial, clienteId)
      if (!respuestaIA) return

      await this.conversacionService.agregarMensaje(conversacion.id, { role: 'assistant', content: respuestaIA })
      await this.agenteService.incrementarContadores(agente.id, 1)
      await this.waService.enviarTexto(from, respuestaIA, config)

      this.logger.log(`[WA] Respuesta enviada a ${from}: "${respuestaIA.slice(0, 80)}"`)
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
  ): Promise<string | null> {
    const apiKeyConfig = await this.confClienteService.obtenerPorClave(clienteId, 'ANTHROPIC_API_KEY')
    const apiKey = apiKeyConfig?.valor
    if (!apiKey || apiKey.includes('•')) {
      this.logger.error('[WA] ANTHROPIC_API_KEY no configurada para este cliente')
      return null
    }

    const systemPrompt = agente.systemPrompt ||
      `Eres ${agente.nombre}, un asistente IA ${agente.tono || 'profesional'}. Responde en ${agente.idioma || 'español'} de forma concisa y útil.`

    try {
      const res = await axios.post(
        ANTHROPIC_API,
        {
          model: agente.modelo || 'claude-haiku-4-5',
          max_tokens: agente.maxTokens || 256,
          system: systemPrompt,
          messages: mensajes,
        },
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        },
      )
      return res.data?.content?.[0]?.text || null
    } catch (err: any) {
      this.logger.error(`[WA] Error llamando a Claude: ${err?.response?.data?.error?.message || err.message}`)
      return null
    }
  }
}
