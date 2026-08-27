import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { Credentials } from 'google-auth-library'
import { GoogleCalendarService } from './google-calendar.service'
import { AgenteGoogleCalendarService } from './agente-google-calendar.service'
import { ExcepcionHorarioAgenteService } from '../../reservacion/service/excepcion-horario-agente.service'
import { utcAFechaHoraBolivia } from '../../../common/lib/fecha-bolivia.util'
import { USUARIO_SISTEMA } from '../../../common/constants'

/**
 * Dirección Google → CRM: cada 15 min trae los cambios del Google Calendar de cada
 * agente conectado y los refleja como `ExcepcionHorarioAgente` puntuales, para que no
 * se ofrezcan esas franjas al agendar nuevas citas. Ignora los eventos que el propio
 * CRM creó (marca `extendedProperties.private.origen === 'crm'`) para no reprocesar
 * su propio eco. Mismo cron que `RecordatorioService` (`*\/15 * * * *`).
 */
@Injectable()
export class GoogleCalendarPollingService {
  private readonly logger = new Logger(GoogleCalendarPollingService.name)

  constructor(
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly agenteGoogleCalendarService: AgenteGoogleCalendarService,
    private readonly excepcionHorarioAgenteService: ExcepcionHorarioAgenteService,
  ) {}

  @Cron('*/15 * * * *')
  async cronSincronizacion(): Promise<void> {
    const conexiones = await this.agenteGoogleCalendarService.listarActivas()
    for (const conexion of conexiones) {
      await this.sincronizarConexion(conexion).catch(e =>
        this.logger.warn(`[GoogleCalendarPolling] agente ${conexion.agenteId}: ${e.message}`),
      )
    }
  }

  private async sincronizarConexion(conexion: {
    id: string
    agenteId: string
    clienteId: string
    accessToken: string
    refreshToken: string
    expiraEn?: Date | null
    calendarId: string
    syncToken?: string | null
  }): Promise<void> {
    const resultado = await this.googleCalendarService.listarCambios(conexion, tokens => this.persistirTokensRenovados(conexion.id, tokens))

    if (resultado.requiereSyncCompleta) {
      await this.agenteGoogleCalendarService.actualizarSyncToken(conexion.id, null)
      this.logger.log(`[GoogleCalendarPolling] syncToken inválido para agente ${conexion.agenteId} — se forzará sync completa en la próxima corrida`)
      return
    }

    for (const evento of resultado.eventos) {
      if (!evento.id) continue
      if (evento.extendedProperties?.private?.origen === 'crm') continue // eco de un evento que ya creamos nosotros

      if (evento.status === 'cancelled') {
        await this.excepcionHorarioAgenteService.eliminarPorGoogleEventId(conexion.agenteId, conexion.clienteId, evento.id, USUARIO_SISTEMA)
        continue
      }

      const inicio = evento.start?.dateTime || evento.start?.date
      const fin = evento.end?.dateTime || evento.end?.date
      if (!inicio || !fin) continue // eventos "todo el día" sin dateTime — fuera de alcance por ahora

      const { fecha, hora: horaInicio } = utcAFechaHoraBolivia(new Date(inicio))
      const { hora: horaFin } = utcAFechaHoraBolivia(new Date(fin))

      await this.excepcionHorarioAgenteService.upsertDesdeGoogle({
        agenteId: conexion.agenteId,
        clienteId: conexion.clienteId,
        fecha,
        horaInicio,
        horaFin,
        motivo: evento.summary || 'Evento de Google Calendar',
        googleEventId: evento.id,
        usuarioSistema: USUARIO_SISTEMA,
      })
    }

    await this.agenteGoogleCalendarService.actualizarSyncToken(conexion.id, resultado.nextSyncToken || null)
  }

  private persistirTokensRenovados(agenteGoogleCalendarId: string, tokens: Credentials): void {
    this.agenteGoogleCalendarService.actualizarTokens(agenteGoogleCalendarId, tokens).catch(e =>
      this.logger.warn(`[GoogleCalendarPolling] No se pudieron persistir los tokens renovados: ${e.message}`),
    )
  }
}
