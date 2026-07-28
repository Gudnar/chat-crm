import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

/**
 * Franja horaria recurrente semanal de un agente (IA o humano). Un mismo día puede
 * tener varias filas (ej. 08:00-10:00, 12:00-14:00, 16:00-20:00) — no hay límite de
 * franjas por día, a diferencia de `Agente.horasTrabajo` (jsonb, una sola franja/día).
 */
@Entity({ name: 'horario_agente', schema: process.env.DB_SCHEMA || 'public' })
@Index(['agenteId', 'diaSemana'])
export class HorarioAgente extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Index()
  @Column({ name: 'agente_id', type: 'bigint' })
  agenteId: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  /** 0 = domingo, 1 = lunes, ..., 6 = sábado (coincide con Date.getDay()) */
  @Column({ name: 'dia_semana', type: 'int' })
  diaSemana: number

  @Column({ name: 'hora_inicio', length: 5 })
  horaInicio: string

  @Column({ name: 'hora_fin', length: 5 })
  horaFin: string

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  constructor(data?: Partial<HorarioAgente>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
