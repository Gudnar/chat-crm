import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'pedido', schema: process.env.DB_SCHEMA || 'public' })
@Index(['clienteId', 'sucursalId'])
@Index(['clienteId', 'codigoPedido'], { unique: true })
@Index(['conversacionId'], { unique: true, where: 'conversacion_id IS NOT NULL' })
export class Pedido extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'sucursal_id', type: 'bigint' })
  sucursalId: string

  @Column({ name: 'cliente_final_id', type: 'bigint', nullable: true })
  clienteFinalId?: string

  @Column({ name: 'conversacion_id', type: 'bigint', nullable: true })
  conversacionId?: string // Liga al chat de WhatsApp que lo originó

  @Column({ name: 'contacto_telefono', length: 20 })
  contactoTelefono: string

  @Column({ name: 'codigo_pedido', length: 50 })
  codigoPedido: string // Prefijo de sucursal + consecutivo (ej. LPZ-00001)

  @Column({ name: 'items', type: 'jsonb' })
  items: Array<{
    productoId: string
    nombre: string
    cantidad: number
    precioUnitario: number
    subtotal: number
    notas?: string
  }>

  @Column({ name: 'subtotal', type: 'decimal', precision: 12, scale: 2 })
  subtotal: number

  @Column({ name: 'descuento', type: 'decimal', precision: 12, scale: 2, default: 0 })
  descuento: number

  @Column({ name: 'total', type: 'decimal', precision: 12, scale: 2 })
  total: number

  @Column({ name: 'tipo_entrega', length: 20, default: 'recojo' })
  tipoEntrega: 'recojo' | 'delivery'

  @Column({ name: 'direccion_entrega', type: 'jsonb', nullable: true })
  direccionEntrega?: {
    direccion: string
    latitud?: number
    longitud?: number
    notas?: string
  }

  @Column({ name: 'estado_pedido', length: 50, default: 'pendiente_confirmacion' })
  estadoPedido: 'pendiente_confirmacion' | 'confirmado' | 'en_preparacion' | 'listo' | 'en_camino' | 'entregado' | 'cancelado'

  @Column({ name: 'estado_pago', length: 20, default: 'pendiente' })
  estadoPago: 'pendiente' | 'pagado' | 'parcial' | 'anulado'

  @Column({ name: 'fecha_confirmacion', type: 'timestamptz', nullable: true })
  fechaConfirmacion?: Date

  @Column({ name: 'fecha_listo', type: 'timestamptz', nullable: true })
  fechaListo?: Date

  @Column({ name: 'fecha_entrega', type: 'timestamptz', nullable: true })
  fechaEntrega?: Date

  @Column({ name: 'motivo_cancelacion', length: 500, nullable: true })
  motivoCancelacion?: string

  @Column({ name: 'notas', type: 'text', nullable: true })
  notas?: string

  constructor(data?: Partial<Pedido>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
