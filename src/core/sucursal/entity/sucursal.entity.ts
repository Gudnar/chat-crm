import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'sucursal', schema: process.env.DB_SCHEMA || 'public' })
export class Sucursal extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id!: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId!: string

  @Column({ name: 'nombre', length: 200 })
  nombre!: string

  @Column({ name: 'codigo', length: 15 })
  codigo!: string // Prefijo único por cliente para generar codigoPedido (ej. LPZ)

  @Column({ name: 'direccion', length: 500, nullable: true })
  direccion?: string

  @Column({ name: 'telefono', length: 20, nullable: true })
  telefono?: string

  @Column({ name: 'latitud', type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitud?: number

  @Column({ name: 'longitud', type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitud?: number

  @Column({ name: 'horarios', type: 'jsonb', default: '{}' })
  horarios!: Record<string, any> // {lunes: {inicio: "08:00", fin: "18:00"}, ...}

  // ── Campos de tienda/ecommerce ──────────────────────
  @Column({ name: 'acepta_pago_qr', type: 'boolean', default: true })
  aceptaPagoQr!: boolean

  @Column({ name: 'acepta_pago_efectivo', type: 'boolean', default: true })
  aceptaPagoEfectivo!: boolean

  @Column({ name: 'qr_imagen_url', length: 500, nullable: true })
  qrImagenUrl?: string

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo!: boolean

  constructor(data?: Partial<Sucursal>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
