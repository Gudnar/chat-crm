import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm'
import { Cliente } from '../../cliente/entity/cliente.entity'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'conversacion', schema: process.env.DB_SCHEMA || 'public' })
export class Conversacion extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'agente_id', type: 'bigint', nullable: true })
  agenteId: string | null

  // Agente humano asignado al seguimiento (null si la atiende solo la IA)
  @Index()
  @Column({ name: 'agente_humano_id', type: 'bigint', nullable: true })
  agenteHumanoId: string | null

  // 'ia' | 'humano' — quién tiene la conversación actualmente
  @Column({ name: 'tipo_agente_asignado', type: 'varchar', length: 20, nullable: true })
  tipoAgenteAsignado?: string | null

  @Column({ name: 'fecha_asignacion_humano', type: 'timestamptz', nullable: true })
  fechaAsignacionHumano?: Date | null

  @Column({ name: 'contacto', length: 200 })
  contacto: string

  @Column({ name: 'canal', length: 30, default: 'chat' })
  canal: string

  @Column({ name: 'estado_conversacion', length: 30, default: 'abierto' })
  estadoConversacion: string

  @Column({ name: 'score', type: 'int', default: 0 })
  score: number

  @Column({ name: 'mensajes', type: 'jsonb', default: '[]' })
  mensajes: Array<{ role: string; content: string; timestamp: string }>

  @Column({ name: 'total_mensajes', type: 'int', default: 0 })
  totalMensajes: number

  @Column({ name: 'escalado', type: 'boolean', default: false })
  escalado: boolean

  @Column({ name: 'etiquetas', type: 'jsonb', default: '[]' })
  etiquetas: string[]

  @Column({ name: 'motivo_score', type: 'text', nullable: true })
  motivoScore?: string

  @Column({ name: 'ultima_calificacion', type: 'timestamptz', nullable: true })
  ultimaCalificacion?: Date

  @Column({ name: 'notas', type: 'text', nullable: true })
  notas?: string

  @Column({ name: 'resolucion', length: 500, nullable: true })
  resolucion?: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente

  constructor(data?: Partial<Conversacion>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
