import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

/** Oferta con vigencia (fecha/hora inicio-fin) sobre UN artículo — precio con tiempo límite. */
@Entity({ name: 'promocion_tienda', schema: process.env.DB_SCHEMA || 'public' })
export class PromocionTienda extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'articulo_id', type: 'bigint' })
  articuloId: string

  /** null = aplica en todas las sucursales del cliente; con valor = solo en esa. */
  @Column({ name: 'sucursal_id', type: 'bigint', nullable: true })
  sucursalId?: string | null

  @Column({ name: 'precio_promocional', type: 'decimal', precision: 10, scale: 2 })
  precioPromocional: number

  @Column({ name: 'fecha_inicio', type: 'timestamptz' })
  fechaInicio: Date

  @Column({ name: 'fecha_fin', type: 'timestamptz' })
  fechaFin: Date

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  constructor(data?: Partial<PromocionTienda>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
