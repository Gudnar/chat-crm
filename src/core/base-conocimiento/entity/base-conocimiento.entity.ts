import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'base_conocimiento', schema: process.env.DB_SCHEMA || 'public' })
export class BaseConocimiento extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'agente_id', type: 'bigint' })
  agenteId: string

  @Column({ name: 'pregunta', length: 500 })
  pregunta: string

  @Column({ name: 'respuesta', type: 'text' })
  respuesta: string

  @Column({ name: 'categoria', length: 100, nullable: true })
  categoria?: string

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  @Column({ name: 'orden', type: 'int', default: 0 })
  orden: number

  constructor(data?: Partial<BaseConocimiento>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
