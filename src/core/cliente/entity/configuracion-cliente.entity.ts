import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'
import { Cliente } from './cliente.entity'

@Entity({ name: 'configuracion_cliente', schema: process.env.DB_SCHEMA || 'public' })
@Index(['clienteId', 'clave'], { unique: true })
export class ConfiguracionCliente extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'clave', length: 100 })
  clave: string

  @Column({ name: 'valor', type: 'text', nullable: true })
  valor?: string

  @Column({ name: 'tipo', length: 30, default: 'string' })
  tipo: string

  @Column({ name: 'descripcion', length: 300, nullable: true })
  descripcion?: string

  @Column({ name: 'es_secreto', type: 'boolean', default: false })
  esSecreto: boolean

  @ManyToOne(() => Cliente, c => c.configuraciones)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente

  constructor(data?: Partial<ConfiguracionCliente>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
