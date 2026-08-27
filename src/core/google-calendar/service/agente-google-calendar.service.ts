import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Credentials } from 'google-auth-library'
import { AgenteGoogleCalendar } from '../entity/agente-google-calendar.entity'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'

@Injectable()
export class AgenteGoogleCalendarService extends BaseService {
  constructor(
    @InjectRepository(AgenteGoogleCalendar)
    private readonly repo: Repository<AgenteGoogleCalendar>,
  ) {
    super(AgenteGoogleCalendarService.name)
  }

  async obtenerPorAgente(agenteId: string, clienteId: string): Promise<AgenteGoogleCalendar | null> {
    return this.repo.findOne({ where: { agenteId, clienteId, estado: Status.ACTIVE, activo: true } })
  }

  async listarActivas(): Promise<AgenteGoogleCalendar[]> {
    return this.repo.find({ where: { estado: Status.ACTIVE, activo: true } })
  }

  async guardarConexion(
    agenteId: string,
    clienteId: string,
    tokens: Credentials,
    googleEmail: string | undefined,
    usuarioCreacion: string,
  ): Promise<AgenteGoogleCalendar> {
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Google no devolvió refresh_token — probablemente falta access_type=offline+prompt=consent, o el usuario ya había autorizado antes sin revocar')
    }

    const expiraEn = tokens.expiry_date ? new Date(tokens.expiry_date) : undefined
    const existente = await this.repo.findOne({ where: { agenteId, clienteId } })

    if (existente) {
      Object.assign(existente, {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiraEn,
        googleEmail,
        activo: true,
        syncToken: null, // fuerza una sync completa tras (re)conectar
        estado: Status.ACTIVE,
        transaccion: Transacccion.ACTUALIZAR,
        usuarioModificacion: usuarioCreacion,
      })
      return this.repo.save(existente)
    }

    const nueva = this.repo.create({
      agenteId,
      clienteId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiraEn,
      googleEmail,
      activo: true,
      calendarId: 'primary',
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.repo.save(nueva)
  }

  /** Llamado desde el listener `on('tokens', ...)` de GoogleCalendarService cuando Google renueva el access_token. */
  async actualizarTokens(id: string, tokens: Credentials): Promise<void> {
    const fila = await this.repo.findOne({ where: { id } })
    if (!fila) return
    if (tokens.access_token) fila.accessToken = tokens.access_token
    if (tokens.refresh_token) fila.refreshToken = tokens.refresh_token
    if (tokens.expiry_date) fila.expiraEn = new Date(tokens.expiry_date)
    await this.repo.save(fila)
  }

  async actualizarSyncToken(id: string, syncToken: string | null): Promise<void> {
    await this.repo.update({ id }, { syncToken })
  }

  async desconectar(agenteId: string, clienteId: string, usuarioModificacion: string): Promise<AgenteGoogleCalendar | null> {
    const existente = await this.obtenerPorAgente(agenteId, clienteId)
    if (!existente) return null
    existente.estado = Status.ELIMINATE
    existente.transaccion = Transacccion.ELIMINAR
    existente.usuarioModificacion = usuarioModificacion
    await this.repo.save(existente)
    return existente
  }
}
