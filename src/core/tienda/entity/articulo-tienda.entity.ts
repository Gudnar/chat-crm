import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

export interface OpcionGrupoTienda {
  id: string
  nombre: string
  precioExtra: number
}

export interface GrupoOpcionesTienda {
  id: string
  nombre: string
  tipo: 'unica' | 'multiple'
  obligatorio: boolean
  min: number
  max: number
  opciones: OpcionGrupoTienda[]
}

/**
 * Catálogo de la tienda online — deliberadamente separado de `Producto` (el que usa
 * `buscar_producto`): un cliente puede vender por chat algo distinto de lo que ofrece
 * en la tienda web. Los grupos de opciones van embebidos como jsonb, mismo criterio
 * que `campos` en `FlowWhatsapp` — se editan siempre junto con el artículo, no hace
 * falta una tabla aparte.
 */
@Entity({ name: 'articulo_tienda', schema: process.env.DB_SCHEMA || 'public' })
export class ArticuloTienda extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'nombre', length: 200 })
  nombre: string

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string

  @Column({ name: 'categoria', length: 100, nullable: true })
  categoria?: string

  @Column({ name: 'imagen_url', length: 500, nullable: true })
  imagenUrl?: string

  @Column({ name: 'precio', type: 'decimal', precision: 10, scale: 2, default: 0 })
  precio: number

  @Column({ name: 'moneda', length: 10, default: 'Bs' })
  moneda: string

  @Column({ name: 'grupos_opciones', type: 'jsonb', default: '[]' })
  gruposOpciones: GrupoOpcionesTienda[]

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  /** Orden manual dentro de su categoría en la grilla de la tienda. */
  @Column({ name: 'orden', type: 'int', default: 0 })
  orden: number

  constructor(data?: Partial<ArticuloTienda>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
