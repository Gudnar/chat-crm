import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

/**
 * Disponibilidad de UN artículo en UNA sucursal — si está habilitado ahí y su stock.
 * Un artículo sin fila acá para una sucursal se considera habilitado y sin control de
 * stock (mismo criterio de "null = ilimitado" que ya usa `Producto.stock`), para que
 * los artículos existentes de clientes sin sucursales no se rompan por default.
 */
@Entity({ name: 'articulo_sucursal', schema: process.env.DB_SCHEMA || 'public' })
@Index(['articuloId', 'sucursalId'], { unique: true })
export class ArticuloSucursal extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'articulo_id', type: 'bigint' })
  articuloId: string

  @Column({ name: 'sucursal_id', type: 'bigint' })
  sucursalId: string

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  @Column({ name: 'stock', type: 'int', nullable: true })
  stock?: number | null

  constructor(data?: Partial<ArticuloSucursal>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
