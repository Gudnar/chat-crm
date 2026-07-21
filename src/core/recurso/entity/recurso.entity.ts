import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

export enum TipoRecurso {
  PDF = 'PDF',
  IMAGEN = 'IMAGEN',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
}

@Entity({ name: 'recurso', schema: process.env.DB_SCHEMA || 'public' })
@Index('idx_recurso_cliente_categoria', ['clienteId', 'categoria'])
export class Recurso extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'agente_id', type: 'bigint', nullable: true })
  agenteId?: string

  @Column({ name: 'nombre', length: 200 })
  nombre: string

  @Column({ name: 'tipo', length: 50, enum: TipoRecurso })
  tipo: TipoRecurso

  @Column({ name: 'categoria', length: 100, nullable: true })
  categoria?: string

  @Column({ name: 'keywords', type: 'text', array: true, default: () => 'ARRAY[]::text[]' })
  keywords: string[]

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string

  @Column({ name: 'archivo_local', length: 255, nullable: true })
  archivoLocal?: string

  @Column({ name: 'url_externa', length: 500, nullable: true })
  urlExterna?: string

  @Column({ name: 'tamano_bytes', type: 'integer', nullable: true })
  tamanobytes?: number

  @Column({ name: 'mime_type', length: 50, nullable: true })
  mimeType?: string

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  constructor(data?: Partial<Recurso>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
