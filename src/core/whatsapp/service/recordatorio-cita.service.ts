import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { AgenteService } from '../../agente/service/agente.service'
import { ReservacionService } from '../../reservacion/service/reservacion.service'
import { ConversacionService } from '../../conversacion/service/conversacion.service'
import { PlantillaWhatsappService } from './plantilla-whatsapp.service'
import { WhatsappService, WaConfig } from './whatsapp.service'
import { Agente } from '../../agente/entity/agente.entity'
import { Reserva } from '../../reservacion/entity/reserva.entity'
import { EstadoPlantillaWhatsapp } from '../../../common/constants'
import { estaFueraDeVentana24h } from '../../../common/lib/ventana-24h.util'

const MENSAJE_RECORDATORIO_CITA_DEFAULT =
  'Te recordamos tu llamada con nuestro asesor comercial. ¡Te esperamos! 📞'

/**
 * Avisa al cliente N horas antes de una llamada ya confirmada con agendar_cita.
 * Corre cada 15 min, solo para agentes con `recordatorioCitaActivo = true`.
 *
 * Si al momento de mandar el aviso ya pasaron 24h desde el último mensaje del
 * cliente, WhatsApp exige una plantilla aprobada en vez de texto libre — mismo
 * patrón ya usado en RemarketingService (estaFueraDeVentana24h + plantilla de
 * respaldo). Sin conversación asociada o sin plantilla configurada, se omite el
 * envío en vez de arriesgarse a que Meta lo rechace.
 */
@Injectable()
export class RecordatorioCitaService {
  private readonly logger = new Logger(RecordatorioCitaService.name)

  constructor(
    private readonly agenteService: AgenteService,
    private readonly reservacionService: ReservacionService,
    private readonly conversacionService: ConversacionService,
    private readonly plantillaService: PlantillaWhatsappService,
    private readonly waService: WhatsappService,
  ) {}

  @Cron('*/15 * * * *')
  async cronRecordatoriosCita(): Promise<void> {
    try {
      const agentes = await this.agenteService.listarConRecordatorioCitaActivo()
      for (const agente of agentes) {
        await this.procesarAgente(agente).catch(e =>
          this.logger.warn(`[RecordatorioCita] Cron agente ${agente.id}: ${e.message}`),
        )
      }
    } catch (e: any) {
      this.logger.error(`[RecordatorioCita] Cron error: ${e.message}`)
    }
  }

  private async procesarAgente(agente: Agente): Promise<void> {
    const horas = agente.recordatorioCitaHoras || 2
    const reservas = await this.reservacionService.listarPendientesParaRecordatorioCita(agente.id, horas)
    if (!reservas.length) return

    const config = await this.waService.obtenerConfig(agente.clienteId)
    if (!config.enabled || !config.accessToken) return

    const mensajeBase = agente.recordatorioCitaMensaje?.trim() || MENSAJE_RECORDATORIO_CITA_DEFAULT

    for (const reserva of reservas) {
      await this.procesarReserva(reserva, agente, config, mensajeBase).catch(e =>
        this.logger.warn(`[RecordatorioCita] Reserva ${reserva.id}: ${e.message}`),
      )
    }
  }

  private async procesarReserva(reserva: Reserva, agente: Agente, config: WaConfig, mensajeBase: string): Promise<void> {
    if (!reserva.contactoTelefono) {
      this.logger.warn(`[RecordatorioCita] Reserva ${reserva.id} sin contactoTelefono — se omite`)
      await this.reservacionService.marcarRecordatorioCitaEnviado(reserva.id)
      return
    }

    const hora = new Date(reserva.fechaInicio).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', timeZone: 'America/La_Paz' })
    const mensaje = `${mensajeBase} Hoy a las ${hora}.`

    let mensajesConversacion: Array<{ role: string; timestamp: string }> = []
    if (reserva.conversacionId) {
      try {
        const conv = await this.conversacionService.obtener(reserva.conversacionId)
        mensajesConversacion = conv.mensajes || []
      } catch {
        // conversación no encontrada — se trata como fuera de ventana más abajo
      }
    }

    // Sin conversación asociada no hay forma de confirmar actividad reciente real —
    // se trata como fuera de ventana para no arriesgarse a un envío libre rechazado.
    const fueraDeVentana = !reserva.conversacionId || estaFueraDeVentana24h(mensajesConversacion)

    if (!fueraDeVentana) {
      await this.waService.enviarTexto(reserva.contactoTelefono, mensaje, config)
    } else {
      const enviadaPorPlantilla = await this.enviarPorPlantilla(reserva, agente, config, hora)
      if (!enviadaPorPlantilla) {
        await this.reservacionService.marcarRecordatorioCitaEnviado(reserva.id)
        return
      }
    }

    if (reserva.conversacionId) {
      await this.conversacionService.agregarMensaje(reserva.conversacionId, { role: 'assistant', content: mensaje }).catch(() => {})
    }
    await this.reservacionService.marcarRecordatorioCitaEnviado(reserva.id)
    this.logger.log(`[RecordatorioCita] Recordatorio enviado para reserva ${reserva.id} (${fueraDeVentana ? 'plantilla' : 'texto libre'})`)
  }

  /** Devuelve true si logró enviar por plantilla; false si hubo que omitir el envío. */
  private async enviarPorPlantilla(reserva: Reserva, agente: Agente, config: WaConfig, hora: string): Promise<boolean> {
    if (!agente.recordatorioCitaPlantillaId) {
      this.logger.warn(`[RecordatorioCita] Reserva ${reserva.id} fuera de ventana de 24h y sin plantilla configurada — se omite el envío`)
      return false
    }
    const plantilla = await this.plantillaService.obtener(agente.recordatorioCitaPlantillaId, agente.clienteId).catch(() => null)
    if (!plantilla || plantilla.estadoPlantilla !== EstadoPlantillaWhatsapp.APROBADA) {
      this.logger.warn(`[RecordatorioCita] Reserva ${reserva.id}: la plantilla configurada no está aprobada — se omite el envío`)
      return false
    }

    const placeholders = (plantilla.componentes.body.texto.match(/\{\{\d+\}\}/g) || []).length
    if (placeholders > 1) {
      this.logger.warn(`[RecordatorioCita] Reserva ${reserva.id}: la plantilla tiene más de una variable — no soportado, se omite el envío`)
      return false
    }
    const componentesEnvio = placeholders === 1
      ? [{ type: 'body', parameters: [{ type: 'text', text: hora }] }]
      : []
    await this.waService.enviarPlantilla(reserva.contactoTelefono!, plantilla.nombre, plantilla.idioma, componentesEnvio, config)
    return true
  }
}
