import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'caja_sucursal', schema: process.env.DB_SCHEMA || 'public' })
@Index(['clienteId', 'sucursalId', 'estado'])
export class CajaSucursal extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'sucursal_id', type: 'bigint' })
  sucursalId: string

  @Column({ name: 'usuario_id', type: 'bigint' })
  usuarioId: string

  @Column({ name: 'fecha_apertura', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fechaApertura: Date

  @Column({ name: 'monto_apertura', type: 'decimal', precision: 12, scale: 2 })
  montoApertura: number

  @Column({ name: 'fecha_cierre', type: 'timestamptz', nullable: true })
  fechaCierre?: Date

  @Column({ name: 'monto_cierre_declarado', type: 'decimal', precision: 12, scale: 2, nullable: true })
  montoCierreDeclarado?: number

  @Column({ name: 'monto_cierre_calculado', type: 'decimal', precision: 12, scale: 2, nullable: true })
  montoCierreCalculado?: number // Suma de transacciones + montoApertura

  @Column({ name: 'diferencia', type: 'decimal', precision: 12, scale: 2, nullable: true })
  diferencia?: number // montoCierreDeclarado - montoCierreCalculado

  @Column({ name: 'estado_caja', length: 50, default: 'abierta' })
  estadoCaja: 'abierta' | 'cerrada'

  @Column({ name: 'notas', type: 'text', nullable: true })
  notas?: string

  constructor(data?: Partial<CajaSucursal>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
