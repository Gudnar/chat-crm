import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'cliente_final', schema: process.env.DB_SCHEMA || 'public' })
@Index(['clienteId', 'telefono'], { unique: true })
export class ClienteFinal extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'sucursal_id', type: 'bigint', nullable: true })
  sucursalId?: string // Sucursal preferida

  @Column({ name: 'nombre', length: 200 })
  nombre: string

  @Column({ name: 'telefono', length: 20 })
  telefono: string

  @Column({ name: 'direcciones', type: 'jsonb', default: '[]' })
  direcciones: Array<{
    id?: string
    nombre?: string
    direccion: string
    latitud?: number
    longitud?: number
    activa?: boolean
  }>

  @Column({ name: 'notas', type: 'text', nullable: true })
  notas?: string

  @Column({ name: 'total_pedidos', type: 'int', default: 0 })
  totalPedidos: number

  @Column({ name: 'total_gastado', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalGastado: number

  @Column({ name: 'ultima_compra', type: 'timestamptz', nullable: true })
  ultimaCompra?: Date

  constructor(data?: Partial<ClienteFinal>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
