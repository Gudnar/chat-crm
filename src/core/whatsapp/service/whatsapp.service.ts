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
