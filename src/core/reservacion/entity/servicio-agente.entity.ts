import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'servicio_agente', schema: process.env.DB_SCHEMA || 'public' })
export class ServicioAgente extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Index()
  @Column({ name: 'agente_id', type: 'bigint' })
  agenteId: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'nombre', length: 150 })
  nombre: string

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string

  @Column({ name: 'duracion_minutos', type: 'int' })
  duracionMinutos: number

  @Column({ name: 'precio', type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio?: number

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  constructor(data?: Partial<ServicioAgente>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
