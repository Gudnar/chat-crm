import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { AgenteService } from '../../agente/service/agente.service'
import { ConversacionService } from '../../conversacion/service/conversacion.service'
import { WhatsappService } from './whatsapp.service'
import { Agente } from '../../agente/entity/agente.entity'

const MENSAJE_RECORDATORIO_DEFAULT =
  'Hola 👋 Quería recordarle que nos falta su foto y ubicación para poder coordinar. Si tiene alguna duda, con gusto lo ayudo. 🙌'

/**
 * Recordatorio automático: si una conversación queda "pendiente" sin que el cliente
 * mande foto ni ubicación, y pasaron N horas desde su último mensaje, se le reenvía
 * un aviso — una sola vez, sin que nadie tenga que revisarlo a mano. Solo corre para
 * agentes con `recordatorioActivo = true` (ver Agente.recordatorioHoras/Mensaje).
 *
 * Cae dentro de la ventana de 24h de WhatsApp mientras `recordatorioHoras` sea menor
 * a 24 — pasado ese punto, Meta exige una plantilla aprobada en vez de texto libre
 * (pendiente, ver plan de plantillas).
 */
@Injectable()
export class RecordatorioService {
  private readonly logger = new Logger(RecordatorioService.name)

  constructor(
    private readonly agenteService: AgenteService,
    private readonly conversacionService: ConversacionService,
    private readonly waService: WhatsappService,
  ) {}

  @Cron('*/15 * * * *')
  async cronRecordatorios(): Promise<void> {
    try {
      const agentes = await this.agenteService.listarConRecordatorioActivo()
      for (const agente of agentes) {
        await this.procesarAgente(agente).catch(e =>
          this.logger.warn(`[Recordatorio] Cron agente ${agente.id}: ${e.message}`),
        )
      }
    } catch (e: any) {
      this.logger.error(`[Recordatorio] Cron error: ${e.message}`)
    }
  }

  private async procesarAgente(agente: Agente): Promise<void> {
    const horas = agente.recordatorioHoras || 3
    const pendientes = await this.conversacionService.listarPendientesParaRecordatorio(agente.id, horas)
    if (!pendientes.length) return

    const config = await this.waService.obtenerConfig(agente.clienteId)
    if (!config.enabled || !config.accessToken) return

    const mensaje = agente.recordatorioMensaje?.trim() || MENSAJE_RECORDATORIO_DEFAULT

    for (const conv of pendientes) {
      await this.waService.enviarTexto(conv.contacto, mensaje, config)
      await this.conversacionService.agregarMensaje(conv.id, { role: 'assistant', content: mensaje })
      await this.conversacionService.marcarRecordatorioEnviado(conv.id)
      this.logger.log(`[Recordatorio] Enviado a ${conv.contacto} (conversación ${conv.id}, agente ${agente.id})`)
    }
  }
}
