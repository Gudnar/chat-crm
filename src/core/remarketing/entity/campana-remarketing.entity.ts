import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'
import { Cliente } from '../../cliente/entity/cliente.entity'

@Entity({ name: 'campana_remarketing', schema: process.env.DB_SCHEMA || 'public' })
export class CampanaRemarketing extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'nombre', length: 100 })
  nombre: string

  @Column({ name: 'descripcion', length: 500, nullable: true })
  descripcion?: string

  @Column({ name: 'mensaje', type: 'text' })
  mensaje: string

  @Column({ name: 'tipo_mensaje', length: 20, default: 'fijo' })
  tipoMensaje: string // 'fijo' | 'ia'

  @Column({ name: 'programado_en', type: 'timestamptz' })
  programadoEn: Date

  @Column({ name: 'ejecutado_en', type: 'timestamptz', nullable: true })
  ejecutadoEn?: Date

  @Column({ name: 'estado_campana', length: 20, default: 'pendiente' })
  estadoCampana: string // 'pendiente' | 'ejecutando' | 'completado' | 'cancelado'

  @Column({ name: 'score_min', type: 'int', default: 0 })
  scoreMin: number

  @Column({ name: 'score_max', type: 'int', default: 100 })
  scoreMax: number

  @Column({ name: 'canal_objetivo', length: 20, default: 'whatsapp' })
  canalObjetivo: string

  @Column({ name: 'total_enviados', type: 'int', default: 0 })
  totalEnviados: number

  @Column({ name: 'total_errores', type: 'int', default: 0 })
  totalErrores: number

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente

  constructor(data?: Partial<CampanaRemarketing>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
