import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'
import { CampanaRemarketing } from './campana-remarketing.entity'
import { Cliente } from '../../cliente/entity/cliente.entity'

@Entity({ name: 'envio_remarketing', schema: process.env.DB_SCHEMA || 'public' })
export class EnvioRemarketing extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'campana_id', type: 'bigint' })
  campanaId: string

  @Column({ name: 'conversacion_id', type: 'bigint' })
  conversacionId: string

  @Column({ name: 'contacto', length: 200 })
  contacto: string

  @Column({ name: 'score_al_envio', type: 'int', default: 0 })
  scoreAlEnvio: number

  @Column({ name: 'estado_envio', length: 20, default: 'pendiente' })
  estadoEnvio: string // 'pendiente' | 'enviado' | 'error'

  @Column({ name: 'mensaje_enviado', type: 'text', nullable: true })
  mensajeEnviado?: string

  @Column({ name: 'enviado_en', type: 'timestamptz', nullable: true })
  enviadoEn?: Date

  @Column({ name: 'error', type: 'text', nullable: true })
  error?: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @ManyToOne(() => CampanaRemarketing)
  @JoinColumn({ name: 'campana_id' })
  campana: CampanaRemarketing

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente

  constructor(data?: Partial<EnvioRemarketing>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
