import { Injectable, Logger } from '@nestjs/common'
import { Credentials } from 'google-auth-library'
import { GoogleCalendarService } from './google-calendar.service'
import { AgenteGoogleCalendarService } from './agente-google-calendar.service'
import { Reserva } from '../../reservacion/entity/reserva.entity'

/**
 * Dirección CRM → Google: crea/actualiza/borra el evento en el Google Calendar personal
 * del agente cuando cambia una `Reserva`. Nunca lanza — un fallo de Google no debe romper
 * la operación del CRM (mismo criterio que TranscripcionAudioService con OpenAI).
 */
@Injectable()
export class GoogleCalendarSyncService {
  private readonly logger = new Logger(GoogleCalendarSyncService.name)

  constructor(
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly agenteGoogleCalendarService: AgenteGoogleCalendarService,
  ) {}

  async sincronizarCreacion(reserva: Reserva): Promise<string | null> {
    const conexion = await this.agenteGoogleCalendarService.obtenerPorAgente(reserva.agenteId, reserva.clienteId)
    if (!conexion) return null

    try {
      return await this.googleCalendarService.crearEvento(
        conexion,
        { titulo: reserva.titulo, descripcion: reserva.descripcion, fechaInicio: reserva.fechaInicio, fechaFin: reserva.fechaFin, reservaId: reserva.id },
        tokens => this.persistirTokensRenovados(conexion.id, tokens),
      )
    } catch (err: any) {
      this.logger.warn(`[GoogleCalendarSync] No se pudo crear el evento para la reserva ${reserva.id}: ${err.message}`)
      return null
    }
  }

  async sincronizarActualizacion(reserva: Reserva): Promise<void> {
    if (!reserva.googleEventId) return
    const conexion = await this.agenteGoogleCalendarService.obtenerPorAgente(reserva.agenteId, reserva.clienteId)
    if (!conexion) return

    try {
      await this.googleCalendarService.actualizarEvento(
        conexion,
        reserva.googleEventId,
        { titulo: reserva.titulo, descripcion: reserva.descripcion, fechaInicio: reserva.fechaInicio, fechaFin: reserva.fechaFin, reservaId: reserva.id },
        tokens => this.persistirTokensRenovados(conexion.id, tokens),
      )
    } catch (err: any) {
      this.logger.warn(`[GoogleCalendarSync] No se pudo actualizar el evento de la reserva ${reserva.id}: ${err.message}`)
    }
  }

  async sincronizarCancelacion(reserva: Reserva): Promise<void> {
    if (!reserva.googleEventId) return
    const conexion = await this.agenteGoogleCalendarService.obtenerPorAgente(reserva.agenteId, reserva.clienteId)
    if (!conexion) return

    try {
      await this.googleCalendarService.eliminarEvento(conexion, reserva.googleEventId, tokens => this.persistirTokensRenovados(conexion.id, tokens))
    } catch (err: any) {
      this.logger.warn(`[GoogleCalendarSync] No se pudo eliminar el evento de la reserva ${reserva.id}: ${err.message}`)
    }
  }

  private persistirTokensRenovados(agenteGoogleCalendarId: string, tokens: Credentials): void {
    this.agenteGoogleCalendarService.actualizarTokens(agenteGoogleCalendarId, tokens).catch(e =>
      this.logger.warn(`[GoogleCalendarSync] No se pudieron persistir los tokens renovados: ${e.message}`),
    )
  }
}
