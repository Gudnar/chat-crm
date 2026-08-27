import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { google, calendar_v3 } from 'googleapis'
import { OAuth2Client, Credentials } from 'google-auth-library'

const SCOPES = ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/userinfo.email']

export interface EventoCrm {
  titulo: string
  descripcion?: string
  fechaInicio: Date
  fechaFin: Date
  reservaId: string
}

export interface ListaCambiosResultado {
  eventos: calendar_v3.Schema$Event[]
  nextSyncToken?: string | null
  requiereSyncCompleta: boolean
}

/** Wrapper delgado sobre la API de Google Calendar (OAuth2 + eventos) — googleapis resuelve el refresh de tokens. */
@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name)

  constructor(private readonly configService: ConfigService) {}

  private redirectUri(): string {
    const appUrl = (this.configService.get<string>('APP_URL') || 'http://localhost:3001').replace(/\/$/, '')
    return `${appUrl}/google-calendar/oauth/callback`
  }

  private nuevoCliente(): OAuth2Client {
    return new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.redirectUri(),
    )
  }

  generarUrlAutorizacion(state: string): string {
    const client = this.nuevoCliente()
    return client.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: SCOPES, state })
  }

  async intercambiarCodigo(code: string): Promise<Credentials> {
    const client = this.nuevoCliente()
    const { tokens } = await client.getToken(code)
    return tokens
  }

  async obtenerEmailCuenta(tokens: Credentials): Promise<string | undefined> {
    const client = this.nuevoCliente()
    client.setCredentials(tokens)
    const oauth2 = google.oauth2({ version: 'v2', auth: client })
    const { data } = await oauth2.userinfo.get()
    return data.email || undefined
  }

  async revocarToken(accessToken: string): Promise<void> {
    const client = this.nuevoCliente()
    try {
      await client.revokeToken(accessToken)
    } catch (err: any) {
      this.logger.warn(`[GoogleCalendar] No se pudo revocar el token en Google (puede que ya estuviera revocado): ${err.message}`)
    }
  }

  /**
   * Construye un cliente ya autenticado para una cuenta guardada. `onTokensRenovados` se
   * dispara solo cuando Google efectivamente renueva el access_token (vía refresh_token) —
   * hay que persistirlo, si no la próxima llamada vuelve a fallar con el token vencido.
   */
  private clienteAutenticado(
    credenciales: { accessToken: string; refreshToken: string; expiraEn?: Date | null },
    onTokensRenovados: (tokens: Credentials) => void,
  ): OAuth2Client {
    const client = this.nuevoCliente()
    client.setCredentials({
      access_token: credenciales.accessToken,
      refresh_token: credenciales.refreshToken,
      expiry_date: credenciales.expiraEn ? credenciales.expiraEn.getTime() : undefined,
    })
    client.on('tokens', tokens => onTokensRenovados(tokens))
    return client
  }

  async crearEvento(
    credenciales: { accessToken: string; refreshToken: string; expiraEn?: Date | null; calendarId: string },
    evento: EventoCrm,
    onTokensRenovados: (tokens: Credentials) => void,
  ): Promise<string | null> {
    const client = this.clienteAutenticado(credenciales, onTokensRenovados)
    const calendar = google.calendar({ version: 'v3', auth: client })
    const { data } = await calendar.events.insert({
      calendarId: credenciales.calendarId,
      requestBody: {
        summary: evento.titulo,
        description: evento.descripcion,
        start: { dateTime: evento.fechaInicio.toISOString() },
        end: { dateTime: evento.fechaFin.toISOString() },
        extendedProperties: { private: { origen: 'crm', reservaId: evento.reservaId } },
      },
    })
    return data.id || null
  }

  async actualizarEvento(
    credenciales: { accessToken: string; refreshToken: string; expiraEn?: Date | null; calendarId: string },
    googleEventId: string,
    evento: EventoCrm,
    onTokensRenovados: (tokens: Credentials) => void,
  ): Promise<void> {
    const client = this.clienteAutenticado(credenciales, onTokensRenovados)
    const calendar = google.calendar({ version: 'v3', auth: client })
    await calendar.events.patch({
      calendarId: credenciales.calendarId,
      eventId: googleEventId,
      requestBody: {
        summary: evento.titulo,
        description: evento.descripcion,
        start: { dateTime: evento.fechaInicio.toISOString() },
        end: { dateTime: evento.fechaFin.toISOString() },
      },
    })
  }

  async eliminarEvento(
    credenciales: { accessToken: string; refreshToken: string; expiraEn?: Date | null; calendarId: string },
    googleEventId: string,
    onTokensRenovados: (tokens: Credentials) => void,
  ): Promise<void> {
    const client = this.clienteAutenticado(credenciales, onTokensRenovados)
    const calendar = google.calendar({ version: 'v3', auth: client })
    try {
      await calendar.events.delete({ calendarId: credenciales.calendarId, eventId: googleEventId })
    } catch (err: any) {
      if (err.code !== 404 && err.code !== 410) throw err // ya estaba borrado en Google, no es un error real
    }
  }

  /** Sondeo incremental. Sin `syncToken`, trae todo (primera vez); con `410 Gone`, pide sync completa. */
  async listarCambios(
    credenciales: { accessToken: string; refreshToken: string; expiraEn?: Date | null; calendarId: string; syncToken?: string | null },
    onTokensRenovados: (tokens: Credentials) => void,
  ): Promise<ListaCambiosResultado> {
    const client = this.clienteAutenticado(credenciales, onTokensRenovados)
    const calendar = google.calendar({ version: 'v3', auth: client })

    try {
      const { data } = await calendar.events.list({
        calendarId: credenciales.calendarId,
        singleEvents: true,
        syncToken: credenciales.syncToken || undefined,
        timeMin: credenciales.syncToken ? undefined : new Date().toISOString(), // sync completa: solo desde hoy hacia adelante
      })
      return { eventos: data.items || [], nextSyncToken: data.nextSyncToken, requiereSyncCompleta: false }
    } catch (err: any) {
      if (err.code === 410) {
        return { eventos: [], nextSyncToken: null, requiereSyncCompleta: true }
      }
      throw err
    }
  }
}
