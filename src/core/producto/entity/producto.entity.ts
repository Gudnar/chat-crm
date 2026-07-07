import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'producto', schema: process.env.DB_SCHEMA || 'public' })
export class Producto extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'nombre', length: 200 })
  nombre: string

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string

  @Column({ name: 'marca', length: 100, nullable: true })
  marca?: string

  @Column({ name: 'modelo', length: 100, nullable: true })
  modelo?: string

  @Column({ name: 'categoria', length: 100, nullable: true })
  categoria?: string

  @Column({ name: 'precio', type: 'decimal', precision: 10, scale: 2, default: 0 })
  precio: number

  @Column({ name: 'precio_oferta', type: 'decimal', precision: 10, scale: 2, nullable: true })
  precioOferta?: number

  @Column({ name: 'moneda', length: 10, default: 'PEN' })
  moneda: string

  @Column({ name: 'stock', type: 'int', nullable: true })
  stock?: number

  @Column({ name: 'imagenes', type: 'jsonb', default: '[]' })
  imagenes: string[]

  @Column({ name: 'detalles', type: 'jsonb', default: '{}' })
  detalles: Record<string, any>

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  constructor(data?: Partial<Producto>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
