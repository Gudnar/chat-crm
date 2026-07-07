import { Column, Entity, PrimaryGeneratedColumn, Index, CreateDateColumn, BaseEntity } from 'typeorm'

/**
 * Registro inmutable de acciones de agentes humanos (solo INSERT).
 * No extiende AuditoriaEntity porque es un log de auditoría en sí mismo.
 */
@Entity({ name: 'actividad_agente_humano', schema: process.env.DB_SCHEMA || 'public' })
export class ActividadAgenteHumano extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Index()
  @Column({ name: 'agente_humano_id', type: 'bigint' })
  agenteHumanoId: string

  @Column({ name: 'conversacion_id', type: 'bigint', nullable: true })
  conversacionId?: string | null

  // 'login' | 'logout' | 'cambio_estado' | 'asignacion' | 'reasignacion' | 'escalada' | 'cierre' | 'nota'
  @Column({ name: 'tipo_actividad', length: 50 })
  tipoActividad: string

  @Column({ name: 'detalles', type: 'jsonb', default: '{}' })
  detalles: Record<string, any>

  @Index()
  @CreateDateColumn({ name: 'timestamp', type: 'timestamptz', default: () => 'now()' })
  timestamp: Date

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  constructor(data?: Partial<ActividadAgenteHumano>) {
    super()
    if (data) Object.assign(this, data)
  }
}
