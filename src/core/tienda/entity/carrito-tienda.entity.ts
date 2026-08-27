import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

export interface OpcionSeleccionadaCarrito {
  grupoId: string
  grupoNombre: string
  opcionId: string
  opcionNombre: string
  precioExtra: number
}

export interface ItemCarritoTienda {
  id: string
  articuloId: string
  nombre: string
  precioBase: number
  cantidad: number
  notas?: string
  opciones: OpcionSeleccionadaCarrito[]
}

/**
 * La "sesión de compra" del cliente. El `token` es lo único que autoriza a leer/editar
 * el carrito — no hay login en la tienda pública — así que se genera con entropía real
 * (crypto.randomBytes), nunca un código legible/secuencial como `Reserva.codigoReserva`.
 */
@Entity({ name: 'carrito_tienda', schema: process.env.DB_SCHEMA || 'public' })
export class CarritoTienda extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Index({ unique: true })
  @Column({ name: 'token', type: 'varchar', length: 64 })
  token: string

  @Column({ name: 'conversacion_id', type: 'bigint', nullable: true })
  conversacionId?: string

  @Column({ name: 'contacto_telefono', length: 30, nullable: true })
  contactoTelefono?: string

  @Column({ name: 'sucursal_id', type: 'bigint', nullable: true })
  sucursalId?: string

  /** Se genera al confirmar — prefijo de la sucursal + consecutivo (ej. "LPZ-0007"). */
  @Column({ name: 'codigo_pedido', type: 'varchar', length: 30, nullable: true })
  codigoPedido?: string

  @Column({ name: 'metodo_pago', type: 'varchar', length: 20, nullable: true })
  metodoPago?: string // 'qr' | 'efectivo'

  @Column({ name: 'estado_carrito', length: 20, default: 'activo' })
  estadoCarrito: string // 'activo' | 'confirmado' | 'abandonado'

  @Column({ name: 'items', type: 'jsonb', default: '[]' })
  items: ItemCarritoTienda[]

  @Column({ name: 'total', type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number

  @Column({ name: 'confirmado_en', type: 'timestamptz', nullable: true })
  confirmadoEn?: Date

  constructor(data?: Partial<CarritoTienda>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
