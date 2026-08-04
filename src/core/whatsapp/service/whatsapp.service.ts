import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'

const WA_API_VERSION = 'v19.0'
const WA_BASE_URL = `https://graph.facebook.com/${WA_API_VERSION}`

export interface WaConfig {
  accessToken: string
  phoneNumberId: string
  wabaId: string
  verifyToken: string
  agenteId: string
  enabled: boolean
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name)

  constructor(private readonly confClienteService: ConfiguracionClienteService) {}

  // ── Config ──────────────────────────────────────────────────

  async obtenerConfig(clienteId: string): Promise<WaConfig> {
    const claves = ['WA_ACCESS_TOKEN', 'WA_PHONE_NUMBER_ID', 'WA_WABA_ID', 'WA_VERIFY_TOKEN', 'WA_AGENTE_ID', 'WA_ENABLED']
    const configs = await Promise.all(claves.map(c => this.confClienteService.obtenerPorClave(clienteId, c)))
    return {
      accessToken:   configs[0]?.valor || '',
      phoneNumberId: configs[1]?.valor || '',
      wabaId:        configs[2]?.valor || '',
      verifyToken:   configs[3]?.valor || 'ide_ia_verify_token',
      agenteId:      configs[4]?.valor || '',
      enabled:       configs[5]?.valor === 'true',
    }
  }

  async guardarConfig(clienteId: string, data: Partial<WaConfig>, usuarioId: string): Promise<void> {
    const entries: Array<{ clave: string; valor: string; esSecreto: boolean; desc: string }> = [
      { clave: 'WA_PHONE_NUMBER_ID', valor: data.phoneNumberId ?? '', esSecreto: false, desc: 'WhatsApp Phone Number ID' },
      { clave: 'WA_WABA_ID',         valor: data.wabaId         ?? '', esSecreto: false, desc: 'WhatsApp Business Account ID' },
      { clave: 'WA_VERIFY_TOKEN',    valor: data.verifyToken    ?? '', esSecreto: false, desc: 'Token de verificación webhook' },
      { clave: 'WA_AGENTE_ID',       valor: data.agenteId       ?? '', esSecreto: false, desc: 'Agente IA asignado a WhatsApp' },
      { clave: 'WA_ENABLED',         valor: String(data.enabled ?? false), esSecreto: false, desc: 'WhatsApp activo/inactivo' },
    ]
    if (data.accessToken && data.accessToken.trim()) {
      entries.push({ clave: 'WA_ACCESS_TOKEN', valor: data.accessToken.trim(), esSecreto: true, desc: 'WhatsApp Cloud API Access Token' })
    }
    for (const { clave, valor, esSecreto, desc } of entries) {
      if (valor !== '') {
        await this.confClienteService.set(clienteId, { clave, valor, esSecreto, descripcion: desc }, usuarioId)
      }
    }
  }

  // ── WhatsApp Cloud API Calls ─────────────────────────────────

  private async apiPost(phoneNumberId: string, accessToken: string, body: object): Promise<any> {
    const url = `${WA_BASE_URL}/${phoneNumberId}/messages`
    const res = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    return res.data
  }

  /** Llamada genérica a un endpoint de administración de Meta (no .../messages) — usada por plantillas. */
  private async apiCall(method: 'get' | 'post' | 'delete', path: string, accessToken: string, data?: object, params?: object): Promise<any> {
    const res = await axios.request({
      method,
      url: `${WA_BASE_URL}/${path}`,
      data,
      params,
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    })
    return res.data
  }

  // ── Plantillas (message templates) ─────────────────────────────
  // Requieren el permiso `whatsapp_business_management` en el access token — el
  // usado solo para mandar mensajes (`whatsapp_business_messaging`) no alcanza.

  /** Crea la plantilla en Meta para revisión — queda en estado PENDING hasta que la aprueben/rechacen. */
  async crearPlantillaMeta(
    config: WaConfig,
    payload: { name: string; category: string; language: string; components: any[] },
  ): Promise<{ id: string; status: string }> {
    return this.apiCall('post', `${config.wabaId}/message_templates`, config.accessToken, payload)
  }

  /** Consulta el estado actual de una plantilla ya creada (APPROVED / REJECTED / PENDING / PAUSED). */
  async consultarEstadoPlantillaMeta(config: WaConfig, metaTemplateId: string): Promise<{ status: string; rejected_reason?: string }> {
    return this.apiCall('get', metaTemplateId, config.accessToken, undefined, { fields: 'status,rejected_reason' })
  }

  /** Elimina la plantilla en Meta (se identifica por nombre, no por ID). */
  async eliminarPlantillaMeta(config: WaConfig, nombre: string): Promise<void> {
    await this.apiCall('delete', `${config.wabaId}/message_templates`, config.accessToken, undefined, { name: nombre })
  }

  /** Manda un mensaje de plantilla ya APROBADA — el único tipo permitido fuera de la ventana de 24h. Lanza si Meta la rechaza (igual que enviarTexto) para que el llamador registre el error por contacto. */
  async enviarPlantilla(to: string, nombrePlantilla: string, idioma: string, componentesEnvio: any[], config: WaConfig): Promise<void> {
    try {
      await this.apiPost(config.phoneNumberId, config.accessToken, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace(/\D/g, ''),
        type: 'template',
        template: {
          name: nombrePlantilla,
          language: { code: idioma },
          ...(componentesEnvio.length ? { components: componentesEnvio } : {}),
        },
      })
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err.message
      this.logger.warn(`[WA] No se pudo enviar plantilla (${nombrePlantilla}): ${msg}`)
      throw new Error(msg)
    }
  }

  async enviarTexto(to: string, text: string, config: WaConfig): Promise<any> {
    if (!config.accessToken || !config.phoneNumberId) {
      this.logger.error(`[WA] Envío fallido — accessToken:${!!config.accessToken} phoneNumberId:${!!config.phoneNumberId}`, '')
      throw new Error('WhatsApp no configurado. Configura Access Token y Phone Number ID.')
    }
    const sanitized = to.replace(/\D/g, '')
    this.logger.log(`[WA] Enviando a ${sanitized} via phoneId=${config.phoneNumberId.slice(-4).padStart(config.phoneNumberId.length, '*')}`)
    try {
      const result = await this.apiPost(config.phoneNumberId, config.accessToken, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: sanitized,
        type: 'text',
        text: { body: text },
      })
      this.logger.log(`[WA] Meta respondió: ${JSON.stringify(result)}`)
      return result
    } catch (err: any) {
      const metaError = err?.response?.data?.error
      this.logger.error(`[WA] Error Meta API: ${metaError?.message || err.message} (code=${metaError?.code})`, '')
      throw new Error(metaError?.message || err.message || 'Error enviando mensaje WhatsApp')
    }
  }

  /**
   * Descarga un adjunto que un cliente envió por WhatsApp. Meta requiere 2 pasos:
   * 1) resolver el media_id a una URL temporal de descarga, 2) bajar el archivo
   * de esa URL — ambos pasos necesitan el access token en el header.
   */
  async descargarMedia(mediaId: string, config: WaConfig): Promise<{ buffer: Buffer; mimeType: string }> {
    const metaRes = await axios.get(`${WA_BASE_URL}/${mediaId}`, {
      headers: { Authorization: `Bearer ${config.accessToken}` },
    })
    const mediaUrl = metaRes.data?.url
    const mimeType = metaRes.data?.mime_type || 'application/octet-stream'
    if (!mediaUrl) throw new Error('Meta no devolvió URL de descarga para el adjunto')

    const fileRes = await axios.get(mediaUrl, {
      headers: { Authorization: `Bearer ${config.accessToken}` },
      responseType: 'arraybuffer',
    })
    return { buffer: Buffer.from(fileRes.data), mimeType }
  }

  async enviarImagen(to: string, imageUrl: string, caption: string, config: WaConfig): Promise<void> {
    try {
      await this.apiPost(config.phoneNumberId, config.accessToken, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace(/\D/g, ''),
        type: 'image',
        image: { link: imageUrl, ...(caption ? { caption } : {}) },
      })
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err.message
      this.logger.warn(`[WA] No se pudo enviar imagen (${imageUrl}): ${msg}`)
    }
  }

  /**
   * Envía un documento (PDF, etc.). Meta descarga el archivo desde `documentUrl`,
   * por lo que debe ser una URL pública HTTPS sin autenticación (máx. 100 MB).
   * `filename` es el nombre que ve el cliente en WhatsApp.
   */
  async enviarDocumento(to: string, documentUrl: string, filename: string, caption: string, config: WaConfig): Promise<void> {
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
      })
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err.message
      this.logger.warn(`[WA] No se pudo enviar documento (${documentUrl}): ${msg}`)
    }
  }

  /** Meta no admite `caption` para audio. */
  async enviarAudio(to: string, audioUrl: string, config: WaConfig): Promise<void> {
    try {
      await this.apiPost(config.phoneNumberId, config.accessToken, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace(/\D/g, ''),
        type: 'audio',
        audio: { link: audioUrl },
      })
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err.message
      this.logger.warn(`[WA] No se pudo enviar audio (${audioUrl}): ${msg}`)
    }
  }

  async enviarVideo(to: string, videoUrl: string, caption: string, config: WaConfig): Promise<void> {
    try {
      await this.apiPost(config.phoneNumberId, config.accessToken, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace(/\D/g, ''),
        type: 'video',
        video: { link: videoUrl, ...(caption ? { caption } : {}) },
      })
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err.message
      this.logger.warn(`[WA] No se pudo enviar video (${videoUrl}): ${msg}`)
    }
  }

  /**
   * Botones de respuesta rápida (hasta 3). El título de cada botón se recorta a 20
   * caracteres — es el límite duro de Meta, mandar más largo hace que la API rechace
   * todo el mensaje.
   */
  async enviarBotones(to: string, cuerpo: string, opciones: Array<{ id: string; titulo: string }>, config: WaConfig): Promise<void> {
    try {
      await this.apiPost(config.phoneNumberId, config.accessToken, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace(/\D/g, ''),
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: cuerpo },
          action: {
            buttons: opciones.slice(0, 3).map(o => ({
              type: 'reply',
              reply: { id: o.id, title: o.titulo.slice(0, 20) },
            })),
          },
        },
      })
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err.message
      this.logger.warn(`[WA] No se pudo enviar botones: ${msg}`)
    }
  }

  /** Lista desplegable (hasta 10 opciones) — para cuando preguntar_opciones trae más de 3. */
  async enviarLista(to: string, cuerpo: string, botonTexto: string, opciones: Array<{ id: string; titulo: string }>, config: WaConfig): Promise<void> {
    try {
      await this.apiPost(config.phoneNumberId, config.accessToken, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace(/\D/g, ''),
        type: 'interactive',
        interactive: {
          type: 'list',
          body: { text: cuerpo },
          action: {
            button: botonTexto.slice(0, 20),
            sections: [{
              title: 'Opciones',
              rows: opciones.slice(0, 10).map(o => ({ id: o.id, title: o.titulo.slice(0, 24) })),
            }],
          },
        },
      })
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err.message
      this.logger.warn(`[WA] No se pudo enviar lista: ${msg}`)
    }
  }

  /** Botón nativo que abre una URL externa — más confiable que pegar el link como texto plano. */
  async enviarBotonLink(to: string, cuerpo: string, textoBoton: string, url: string, config: WaConfig): Promise<void> {
    try {
      await this.apiPost(config.phoneNumberId, config.accessToken, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace(/\D/g, ''),
        type: 'interactive',
        interactive: {
          type: 'cta_url',
          body: { text: cuerpo },
          action: {
            name: 'cta_url',
            parameters: { display_text: textoBoton.slice(0, 20), url },
          },
        },
      })
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err.message
      this.logger.warn(`[WA] No se pudo enviar botón de link (${url}): ${msg}`)
    }
  }

  /** Pide la ubicación real (GPS) del cliente con un botón nativo — la respuesta llega como mensaje type=location. */
  async enviarSolicitudUbicacion(to: string, cuerpo: string, config: WaConfig): Promise<void> {
    try {
      await this.apiPost(config.phoneNumberId, config.accessToken, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace(/\D/g, ''),
        type: 'interactive',
        interactive: {
          type: 'location_request_message',
          body: { text: cuerpo },
          action: { name: 'send_location' },
        },
      })
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err.message
      this.logger.warn(`[WA] No se pudo enviar solicitud de ubicación: ${msg}`)
    }
  }

  async marcarLeido(messageId: string, config: WaConfig): Promise<void> {
    try {
      await this.apiPost(config.phoneNumberId, config.accessToken, {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      })
    } catch { /* non-critical */ }
  }

  async mostrarTyping(messageId: string, config: WaConfig): Promise<void> {
    try {
      await this.apiPost(config.phoneNumberId, config.accessToken, {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
        typing_indicator: { type: 'text' },
      })
    } catch { /* non-critical */ }
  }

  // ── Test connection ───────────────────────────────────────────

  async testConexion(accessToken: string, phoneNumberId: string): Promise<{ valida: boolean; info?: any; mensaje: string }> {
    try {
      const res = await axios.get(`${WA_BASE_URL}/${phoneNumberId}`, {
        params: { fields: 'id,display_phone_number,verified_name,status,quality_rating' },
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const d = res.data
      return {
        valida: true,
        info: {
          displayPhone: d.display_phone_number,
          verifiedName: d.verified_name,
          status: d.status,
          qualityRating: d.quality_rating,
        },
        mensaje: `✅ Conectado: ${d.verified_name || d.display_phone_number}`,
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err.message || 'Error de conexión'
      return { valida: false, mensaje: `❌ ${msg}` }
    }
  }

  // ── WABA Stats ────────────────────────────────────────────────

  async obtenerEstadisticas(clienteId: string): Promise<{ valida: boolean; stats?: any; mensaje: string }> {
    const cfg = await this.obtenerConfig(clienteId)
    if (!cfg.accessToken || !cfg.wabaId) {
      return { valida: false, mensaje: 'WhatsApp no configurado' }
    }
    try {
      const [phoneRes, wabaRes] = await Promise.all([
        axios.get(`${WA_BASE_URL}/${cfg.phoneNumberId}`, {
          params: { fields: 'id,display_phone_number,verified_name,status,quality_rating' },
          headers: { Authorization: `Bearer ${cfg.accessToken}` },
        }),
        axios.get(`${WA_BASE_URL}/${cfg.wabaId}`, {
          params: { fields: 'id,name,currency,timezone_id,message_template_namespace' },
          headers: { Authorization: `Bearer ${cfg.accessToken}` },
        }),
      ])
      return { valida: true, stats: { phone: phoneRes.data, waba: wabaRes.data }, mensaje: 'OK' }
    } catch (err: any) {
      return { valida: false, mensaje: err?.response?.data?.error?.message || 'Error' }
    }
  }
}
