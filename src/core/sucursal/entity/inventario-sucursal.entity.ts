import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'inventario_sucursal', schema: process.env.DB_SCHEMA || 'public' })
@Index(['sucursalId', 'productoId'], { unique: true })
export class InventarioSucursal extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'sucursal_id', type: 'bigint' })
  sucursalId: string

  @Column({ name: 'producto_id', type: 'bigint' })
  productoId: string

  @Column({ name: 'stock', type: 'int', nullable: true })
  stock?: number // null = ilimitado

  @Column({ name: 'stock_minimo', type: 'int', default: 5 })
  stockMinimo: number

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  constructor(data?: Partial<InventarioSucursal>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
