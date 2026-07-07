import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

export interface ParametroHerramienta {
  nombre: string
  tipo: 'string' | 'number' | 'integer' | 'boolean' | 'enum'
  descripcion: string
  requerido: boolean
  opciones?: string[]
  minimo?: number
  maximo?: number
}

@Entity({ name: 'herramienta', schema: process.env.DB_SCHEMA || 'public' })
export class Herramienta extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'agente_id', type: 'bigint' })
  agenteId: string

  @Column({ name: 'nombre', length: 100 })
  nombre: string

  @Column({ name: 'label', length: 150 })
  label: string

  @Column({ name: 'descripcion', length: 500 })
  descripcion: string

  @Column({ name: 'parametros', type: 'jsonb', default: '[]' })
  parametros: string[]

  @Column({ name: 'activa', type: 'boolean', default: true })
  activa: boolean

  @Column({ name: 'auto_confirmar', type: 'boolean', default: true })
  autoConfirmar: boolean

  @Column({ name: 'confianza_minima', type: 'int', default: 70 })
  confianzaMinima: number

  @Column({ name: 'color', length: 20, default: '#6366f1' })
  color: string

  @Column({ name: 'icono', length: 50, default: 'check' })
  icono: string

  @Column({ name: 'ejemplo', type: 'text', nullable: true })
  ejemplo?: string

  constructor(data?: Partial<Herramienta>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
