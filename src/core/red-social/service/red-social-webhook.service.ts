import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import { RedSocialService } from './red-social.service'
import { ConversacionService } from '../../conversacion/service/conversacion.service'
import { AgenteService } from '../../agente/service/agente.service'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'
import { USUARIO_SISTEMA } from '../../../common/constants'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const MAX_HISTORY = 20

@Injectable()
export class RedSocialWebhookService {
  private readonly logger = new Logger(RedSocialWebhookService.name)

  constructor(
    private readonly redSocialService: RedSocialService,
    private readonly conversacionService: ConversacionService,
    private readonly agenteService: AgenteService,
    private readonly confClienteService: ConfiguracionClienteService,
  ) {}

  // ── Instagram ────────────────────────────────────────────────

  async procesarEventoInstagram(entry: any): Promise<void> {
    const igAccountId: string = entry.id

    const cuenta = await this.redSocialService.resolverCuentaPorPageId(igAccountId)
    if (!cuenta || !cuenta.enabled) {
      this.logger.warn(`[IG] Cuenta no encontrada o inactiva para pageId: ${igAccountId}`)
      return
    }

    // DM via messaging
    for (const msg of entry.messaging || []) {
      if (msg.message && !msg.message.is_echo) {
        await this.procesarDM(
          msg.sender?.id,
          msg.sender?.id,
          msg.message.text || '',
          'instagram',
          cuenta,
        ).catch(e => this.logger.error(`[IG] DM error: ${e.message}`))
      }
    }

    // Comments on posts via changes
    for (const change of entry.changes || []) {
      if (change.field === 'comments' && change.value) {
        await this.procesarComentarioIG(change.value, cuenta)
          .catch(e => this.logger.error(`[IG] Comment error: ${e.message}`))
      }
    }
  }

  // ── Facebook ─────────────────────────────────────────────────

  async procesarEventoFacebook(entry: any): Promise<void> {
    const pageId: string = entry.id

    const cuenta = await this.redSocialService.resolverCuentaPorPageId(pageId)
    if (!cuenta || !cuenta.enabled) {
      this.logger.warn(`[FB] Cuenta no encontrada o inactiva para pageId: ${pageId}`)
      return
    }

    // Messenger DMs
    for (const msg of entry.messaging || []) {
      if (msg.message && !msg.message.is_echo) {
        await this.procesarDM(
          msg.sender?.id,
          msg.sender?.id,
          msg.message.text || '',
          'facebook',
          cuenta,
        ).catch(e => this.logger.error(`[FB] DM error: ${e.message}`))
      }
    }

    // Feed comments
    for (const change of entry.changes || []) {
      if (change.field === 'feed' && change.value?.item === 'comment') {
        await this.procesarComentarioFB(change.value, cuenta)
          .catch(e => this.logger.error(`[FB] Feed comment error: ${e.message}`))
      }
    }
  }

  // ── DM handler (FB Messenger + IG DM) ────────────────────────

  private async procesarDM(
    senderId: string,
    contacto: string,
    texto: string,
    plataforma: string,
    cuenta: any,
  ): Promise<void> {
    if (!texto.trim()) return

    if (!cuenta.agenteId) {
      this.logger.warn(`[${plataforma.toUpperCase()}] Sin agente asignado a la cuenta ${cuenta.id}`)
      return
    }

    this.logger.log(`[${plataforma.toUpperCase()}] DM de ${senderId}: "${texto.slice(0, 80)}"`)

    const agente = await this.agenteService.obtener(cuenta.agenteId, cuenta.clienteId)
    if (!agente?.activo) return

    const conversacion = await this.encontrarOCrearConversacion(contacto, agente.id, plataforma, cuenta.clienteId)
    await this.conversacionService.agregarMensaje(conversacion.id, { role: 'user', content: texto })

    const actualizada = await this.conversacionService.obtener(conversacion.id)
    const historial = (actualizada.mensajes || [])
      .slice(-MAX_HISTORY)
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    const respuesta = await this.llamarClaude(agente, historial, cuenta.clienteId)
    if (!respuesta) return

    await this.conversacionService.agregarMensaje(conversacion.id, { role: 'assistant', content: respuesta })
    await this.agenteService.incrementarContadores(agente.id)

    const cuentaCompleta = await this.redSocialService.obtenerCuentaRaw(cuenta.id, cuenta.clienteId)
    if (cuentaCompleta?.accessToken) {
      try {
        await this.redSocialService.enviarMensajeDM(senderId, respuesta, cuentaCompleta.accessToken)
        this.logger.log(`[${plataforma.toUpperCase()}] Respuesta DM enviada a ${senderId}`)
      } catch (e: any) {
        this.logger.error(`[${plataforma.toUpperCase()}] Error enviando DM: ${e.message}`)
      }
    }
  }

  // ── Instagram Comment handler ─────────────────────────────────

  private async procesarComentarioIG(value: any, cuenta: any): Promise<void> {
    const commentId = value.id
    const texto     = value.text
    const postId    = value.media?.id

    if (!texto?.trim()) return

    this.logger.log(`[IG] Comentario en post ${postId}: "${texto.slice(0, 80)}"`)

    const agenteId = await this.resolverAgenteParaPost(postId, cuenta)
    if (!agenteId) return

    const agente = await this.agenteService.obtener(agenteId, cuenta.clienteId)
    if (!agente?.activo) return

    const respuesta = await this.llamarClaudeUnico(agente, texto, cuenta.clienteId)
    if (!respuesta) return

    const cuentaCompleta = await this.redSocialService.obtenerCuentaRaw(cuenta.id, cuenta.clienteId)
    if (cuentaCompleta?.accessToken && commentId) {
      try {
        await this.redSocialService.responderComentarioIG(commentId, respuesta, cuentaCompleta.accessToken)
        this.logger.log(`[IG] Respuesta a comentario ${commentId} enviada`)
      } catch (e: any) {
        this.logger.error(`[IG] Error respondiendo comentario: ${e.message}`)
      }
    }
  }

  // ── Facebook Feed Comment handler ─────────────────────────────

  private async procesarComentarioFB(value: any, cuenta: any): Promise<void> {
    const commentId = value.comment_id
    const texto     = value.message
    const postId    = value.post_id
    const fromId    = value.from?.id || value.sender_id || commentId
    const fromName  = value.from?.name || 'Usuario Facebook'

    if (!texto?.trim()) return

    this.logger.log(`[FB] Comentario de ${fromName} en post ${postId}: "${texto.slice(0, 80)}"`)

    const agenteId = await this.resolverAgenteParaPost(postId, cuenta)
    if (!agenteId) return

    const agente = await this.agenteService.obtener(agenteId, cuenta.clienteId)
    if (!agente?.activo) return

    // Crear/encontrar conversación para seguimiento en Bandeja
    const contactoKey = `fb_comment_${postId}_${fromId}`
    const conversacion = await this.encontrarOCrearConversacion(
      contactoKey, agente.id, 'facebook', cuenta.clienteId,
    )
    await this.conversacionService.agregarMensaje(conversacion.id, {
      role: 'user',
      content: `[Comentario de ${fromName}]: ${texto}`,
    })

    const actualizada = await this.conversacionService.obtener(conversacion.id)
    const historial = (actualizada.mensajes || [])
      .slice(-MAX_HISTORY)
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    const respuesta = await this.llamarClaude(agente, historial, cuenta.clienteId)
    if (!respuesta) return

    await this.conversacionService.agregarMensaje(conversacion.id, { role: 'assistant', content: respuesta })
    await this.agenteService.incrementarContadores(agente.id)

    const cuentaCompleta = await this.redSocialService.obtenerCuentaRaw(cuenta.id, cuenta.clienteId)
    if (cuentaCompleta?.accessToken && commentId) {
      try {
        await this.redSocialService.responderComentarioFB(commentId, respuesta, cuentaCompleta.accessToken)
        this.logger.log(`[FB] Respuesta a comentario ${commentId} enviada`)
      } catch (e: any) {
        this.logger.error(`[FB] Error respondiendo comentario: ${e.message}`)
      }
    }
  }

  // ── Helpers ──────────────────────────────────────────────────

  // ── Importar comentarios históricos como conversaciones ────────

  async importarComentariosComoConversaciones(
    postId: string,
    clienteId: string | null,
  ): Promise<{ importados: number }> {
    const post = await this.redSocialService.obtenerPost(postId, clienteId)
    if (!post?.comentariosData?.length) return { importados: 0 }

    const cuenta = await this.redSocialService.obtenerCuentaRaw(
      post.cuentaId || '', post.clienteId,
    )
    const agenteId = post.agenteId || cuenta?.agenteId
    if (!agenteId) return { importados: 0 }

    let importados = 0
    for (const cm of post.comentariosData) {
      const contactoKey = `fb_comment_${post.postId}_${cm.fromId}`
      const conversacion = await this.encontrarOCrearConversacion(
        contactoKey, agenteId, 'facebook', post.clienteId,
      )
      // Solo agregar si la conversación está recién creada (sin mensajes)
      const existente = await this.conversacionService.obtener(conversacion.id)
      if (!existente.mensajes?.length) {
        await this.conversacionService.agregarMensaje(conversacion.id, {
          role: 'user',
          content: `[Comentario de ${cm.fromName}]: ${cm.message}`,
        })
        importados++
      }
    }
    return { importados }
  }

  private async resolverAgenteParaPost(postId: string | undefined, cuenta: any): Promise<string | null> {
    if (postId) {
      const postEntry = await this.redSocialService.resolverPostPorPostId(postId, cuenta.clienteId)
      if (postEntry?.agenteId) return postEntry.agenteId
    }
    return cuenta.agenteId || null
  }

  private async encontrarOCrearConversacion(contacto: string, agenteId: string, canal: string, clienteId: string) {
    const existentes = await this.conversacionService.listar(clienteId, agenteId)
    const delContacto = existentes.filter(c => c.contacto === contacto && c.canal === canal)

    const abierta = delContacto.find(c => c.estadoConversacion !== 'resuelto' && c.estadoConversacion !== 'cerrado')
    if (abierta) return abierta

    const cerrada = delContacto[0]
    if (cerrada) {
      await this.conversacionService.actualizarEstado(cerrada.id, 'abierto')
      return { ...cerrada, estadoConversacion: 'abierto' }
    }

    return this.conversacionService.crear(
      { agenteId, contacto, canal, etiquetas: [] },
      USUARIO_SISTEMA,
      clienteId,
    )
  }

  private async llamarClaude(
    agente: any,
    mensajes: Array<{ role: 'user' | 'assistant'; content: string }>,
    clienteId: string,
  ): Promise<string | null> {
    const apiKey = await this.obtenerApiKey(clienteId)
    if (!apiKey) return null

    try {
      const systemPrompt = agente.systemPrompt ||
        `Eres ${agente.nombre}, un asistente IA ${agente.tono || 'profesional'}. Responde en ${agente.idioma || 'español'} de forma concisa y útil.`

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
      this.logger.error(`[RS] Claude error: ${err?.response?.data?.error?.message || err.message}`)
      return null
    }
  }

  private async llamarClaudeUnico(agente: any, texto: string, clienteId: string): Promise<string | null> {
    return this.llamarClaude(agente, [{ role: 'user', content: texto }], clienteId)
  }

  private async obtenerApiKey(clienteId: string): Promise<string | null> {
    const cfg = await this.confClienteService.obtenerPorClave(clienteId, 'ANTHROPIC_API_KEY')
    const key = cfg?.valor
    if (!key || key.includes('•')) {
      this.logger.error('[RS] ANTHROPIC_API_KEY no configurada')
      return null
    }
    return key
  }
}
