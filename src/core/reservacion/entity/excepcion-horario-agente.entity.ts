import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

/**
 * Fecha (o rango de fechas) puntual y NO recurrente en la que un agente humano no
 * trabaja: feriado, aniversario, vacaciones. `agenteId` nulo bloquea a TODO el equipo
 * humano del cliente; con valor, solo a ese agente. A diferencia de `HorarioAgente`
 * (recurrente semanal), esta entidad no se repite — cada fecha se carga a mano.
 */
@Entity({ name: 'excepcion_horario_agente', schema: process.env.DB_SCHEMA || 'public' })
@Index(['clienteId', 'fechaInicio', 'fechaFin'])
export class ExcepcionHorarioAgente extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  /** null = bloquea a todo el equipo humano del cliente; con valor, solo a ese agente. */
  @Index()
  @Column({ name: 'agente_id', type: 'bigint', nullable: true })
  agenteId: string | null

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio: string

  @Column({ name: 'fecha_fin', type: 'date' })
  fechaFin: string

  @Column({ name: 'motivo', length: 200 })
  motivo: string

  /** Solo cosmético (icono/color en frontend) — nunca decide si bloquea. 'google_calendar' marca las que vinieron del sondeo de Google. */
  @Column({ name: 'tipo', length: 20, default: 'otro' })
  tipo: string

  /** Ambos null = bloquea el día completo (comportamiento original). Con valor = bloquea solo esa franja del día. */
  @Column({ name: 'hora_inicio', type: 'varchar', length: 5, nullable: true })
  horaInicio?: string | null

  @Column({ name: 'hora_fin', type: 'varchar', length: 5, nullable: true })
  horaFin?: string | null

  /** Evento de Google Calendar que originó esta excepción (solo si tipo === 'google_calendar') — permite borrarla cuando el evento se cancela en Google. */
  @Index()
  @Column({ name: 'google_event_id', type: 'varchar', length: 300, nullable: true })
  googleEventId?: string | null

  constructor(data?: Partial<ExcepcionHorarioAgente>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
