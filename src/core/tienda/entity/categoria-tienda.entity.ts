import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

/**
 * Deliberadamente NO es una FK de `ArticuloTienda.categoria` — ese campo sigue siendo
 * texto libre (igual que `Producto.categoria` en el resto del sistema). Esta tabla solo
 * le agrega imagen/orden a los nombres de categoría que el admin ya está usando en sus
 * artículos, emparejando por nombre en el storefront.
 */
@Entity({ name: 'categoria_tienda', schema: process.env.DB_SCHEMA || 'public' })
export class CategoriaTienda extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'nombre', length: 100 })
  nombre: string

  @Column({ name: 'imagen_url', length: 500, nullable: true })
  imagenUrl?: string

  @Column({ name: 'orden', type: 'int', default: 0 })
  orden: number

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  constructor(data?: Partial<CategoriaTienda>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
