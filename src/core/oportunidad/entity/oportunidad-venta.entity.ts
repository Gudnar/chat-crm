import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'
import { Cliente } from '../../cliente/entity/cliente.entity'
import { Conversacion } from '../../conversacion/entity/conversacion.entity'

export interface HistorialOportunidad {
  timestamp: string
  accion: string // creacion | cambio-estado | seguimiento | asignacion | nota | edicion
  usuarioId: string
  usuarioNombre: string
  detalles: string
  // Solo para entradas corregidas después (seguimientos y notas)
  editado?: boolean
  editadoPor?: string
  editadoEn?: string
}

@Entity({ name: 'oportunidad_venta', schema: process.env.DB_SCHEMA || 'public' })
export class OportunidadVenta extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Index()
  @Column({ name: 'numero_oportunidad', length: 50, unique: true })
  numeroOportunidad: string

  // Estado del pipeline (no confundir con _estado de auditoría)
  @Index()
  @Column({ name: 'estado_oportunidad', type: 'varchar', length: 50, default: 'prospecto' })
  estadoOportunidad: string

  @Column({ name: 'prioridad', length: 20, default: 'media' })
  prioridad: string

  @Column({ name: 'monto_estimado', type: 'decimal', precision: 12, scale: 2, nullable: true })
  montoEstimado?: number | null

  @Column({ name: 'moneda', length: 10, default: 'USD' })
  moneda: string

  @Column({ name: 'contacto_nombre', length: 200 })
  contactoNombre: string

  @Column({ name: 'contacto_telefono', type: 'varchar', length: 50, nullable: true })
  contactoTelefono?: string | null

  @Column({ name: 'contacto_email', type: 'varchar', length: 150, nullable: true })
  contactoEmail?: string | null

  @Column({ name: 'empresa', type: 'varchar', length: 200, nullable: true })
  empresa?: string | null

  @Column({ name: 'origen', length: 30, default: 'otro' })
  origen: string

  @Column({ name: 'producto_interes', type: 'varchar', length: 300, nullable: true })
  productoInteres?: string | null

  @Index()
  @Column({ name: 'conversacion_id', type: 'bigint', nullable: true })
  conversacionId?: string | null

  // Fecha y hora del primer mensaje del contacto (tomada de la conversación vinculada)
  @Column({ name: 'fecha_primer_contacto', type: 'timestamptz', nullable: true })
  fechaPrimerContacto?: Date | null

  @ManyToOne(() => Conversacion)
  @JoinColumn({ name: 'conversacion_id' })
  conversacion?: Conversacion

  // Usuario responsable del seguimiento
  @Index()
  @Column({ name: 'asignado_a', type: 'bigint', nullable: true })
  asignadoA?: string | null

  @Column({ name: 'asignado_nombre', type: 'varchar', length: 200, nullable: true })
  asignadoNombre?: string | null

  @Column({ name: 'proxima_accion', type: 'varchar', length: 300, nullable: true })
  proximaAccion?: string | null

  @Column({ name: 'proxima_accion_fecha', type: 'timestamptz', nullable: true })
  proximaAccionFecha?: Date | null

  @Column({ name: 'motivo_cierre', type: 'varchar', length: 500, nullable: true })
  motivoCierre?: string | null

  @Column({ name: 'fecha_cierre', type: 'timestamptz', nullable: true })
  fechaCierre?: Date | null

  @Column({ name: 'notas', type: 'text', nullable: true })
  notas?: string | null

  // Historial inmutable: solo se agregan entradas desde el service
  @Column({ name: 'historial', type: 'jsonb', default: '[]' })
  historial: HistorialOportunidad[]

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente

  constructor(data?: Partial<OportunidadVenta>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
