import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

/** Cuenta personal de Google Calendar conectada por un agente humano (1 fila por agente). */
@Entity({ name: 'agente_google_calendar', schema: process.env.DB_SCHEMA || 'public' })
export class AgenteGoogleCalendar extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Index({ unique: true })
  @Column({ name: 'agente_id', type: 'bigint' })
  agenteId: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'google_email', length: 200, nullable: true })
  googleEmail?: string

  @Column({ name: 'access_token', type: 'text' })
  accessToken: string

  @Column({ name: 'refresh_token', type: 'text' })
  refreshToken: string

  @Column({ name: 'expira_en', type: 'timestamptz', nullable: true })
  expiraEn?: Date

  @Column({ name: 'calendar_id', length: 200, default: 'primary' })
  calendarId: string

  /** null = la próxima sincronización debe ser completa (primera vez, o el token anterior quedó inválido). */
  @Column({ name: 'sync_token', type: 'text', nullable: true })
  syncToken?: string | null

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  constructor(data?: Partial<AgenteGoogleCalendar>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
