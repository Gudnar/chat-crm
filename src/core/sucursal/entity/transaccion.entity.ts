import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'transaccion', schema: process.env.DB_SCHEMA || 'public' })
@Index(['clienteId', 'sucursalId', 'fecha'])
@Index(['pedidoId'], { where: 'pedido_id IS NOT NULL' })
export class Transaccion extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'sucursal_id', type: 'bigint' })
  sucursalId: string

  @Column({ name: 'pedido_id', type: 'bigint', nullable: true })
  pedidoId?: string

  @Column({ name: 'caja_sucursal_id', type: 'bigint', nullable: true })
  cajaSucursalId?: string

  @Column({ name: 'tipo', length: 50 })
  tipo: 'venta' | 'reembolso' | 'gasto' | 'ingreso_manual'

  @Column({ name: 'metodo_pago', length: 50, nullable: true })
  metodoPago?: 'qr' | 'efectivo' | 'transferencia' | 'otro'

  @Column({ name: 'monto', type: 'decimal', precision: 12, scale: 2 })
  monto: number

  @Column({ name: 'estado_transaccion', length: 50, default: 'confirmado' })
  estadoTransaccion: 'pendiente' | 'confirmado' | 'anulado'

  @Column({ name: 'referencia', length: 200, nullable: true })
  referencia?: string

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string

  @Column({ name: 'fecha', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date

  constructor(data?: Partial<Transaccion>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
