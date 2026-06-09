import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'configuracion', schema: process.env.DB_SCHEMA || 'public' })
export class Configuracion extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'clave', length: 100, unique: true })
  clave: string

  @Column({ name: 'valor', type: 'text', nullable: true })
  valor?: string

  @Column({ name: 'tipo', length: 30, default: 'string' })
  tipo: string

  @Column({ name: 'descripcion', length: 300, nullable: true })
  descripcion?: string

  @Column({ name: 'es_secreto', type: 'boolean', default: false })
  esSecreto: boolean

  constructor(data?: Partial<Configuracion>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
