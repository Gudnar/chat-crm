import { Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import FormData from 'form-data'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'

const OPENAI_TRANSCRIPTIONS_API = 'https://api.openai.com/v1/audio/transcriptions'

const EXTENSION_POR_MIME: Record<string, string> = {
  'audio/ogg': 'ogg',
  'audio/mpeg': 'mp3',
  'audio/amr': 'amr',
  'audio/aac': 'aac',
}

/** Transcribe notas de voz de WhatsApp vía OpenAI Whisper — Claude no acepta audio como input. */
@Injectable()
export class TranscripcionAudioService {
  private readonly logger = new Logger(TranscripcionAudioService.name)

  constructor(private readonly confClienteService: ConfiguracionClienteService) {}

  /** Devuelve el texto transcrito, o `null` si no hay API key configurada o la llamada falla (nunca lanza). */
  async transcribir(buffer: Buffer, mimeType: string, clienteId: string): Promise<string | null> {
    const apiKeyConfig = await this.confClienteService.obtenerPorClave(clienteId, 'OPENAI_API_KEY')
    const apiKey = apiKeyConfig?.valor
    if (!apiKey || apiKey.includes('•')) return null

    try {
      const base = (mimeType || '').split(';')[0].trim()
      const ext = EXTENSION_POR_MIME[base] || 'bin'

      const form = new FormData()
      form.append('file', buffer, { filename: `audio.${ext}`, contentType: base || 'application/octet-stream' })
      form.append('model', 'whisper-1')

      const { data } = await axios.post(OPENAI_TRANSCRIPTIONS_API, form, {
        headers: { Authorization: `Bearer ${apiKey}`, ...form.getHeaders() },
      })
      return data?.text?.trim() || null
    } catch (err: any) {
      this.logger.error(`[Transcripcion] Falló la transcripción con OpenAI Whisper: ${err.message}`)
      return null
    }
  }
}
