import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'
import { EstadoReserva } from '../../../common/constants'

/**
 * Reserva agnóstica al tipo de agente: `agenteId` puede apuntar tanto a un agente IA
 * como a uno humano (misma tabla `agente`, discriminada por `tipoAgente`). Se
 * desnormaliza `tipoAgenteReserva` al crear para no tener que joinear `agente` en
 * cada listado/filtro.
 */
@Entity({ name: 'reserva', schema: process.env.DB_SCHEMA || 'public' })
@Index(['agenteId', 'fechaInicio'])
export class Reserva extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'codigo_reserva', length: 30, unique: true })
  codigoReserva: string

  @Index()
  @Column({ name: 'agente_id', type: 'bigint' })
  agenteId: string

  @Column({ name: 'tipo_agente_reserva', length: 10 })
  tipoAgenteReserva: string

  @Column({ name: 'servicio_agente_id', type: 'bigint', nullable: true })
  servicioAgenteId?: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'conversacion_id', type: 'bigint', nullable: true })
  conversacionId?: string

  @Column({ name: 'contacto_nombre', length: 200 })
  contactoNombre: string

  @Column({ name: 'contacto_telefono', length: 30, nullable: true })
  contactoTelefono?: string

  @Column({ name: 'contacto_email', length: 150, nullable: true })
  contactoEmail?: string

  @Column({ name: 'fecha_inicio', type: 'timestamptz' })
  fechaInicio: Date

  @Column({ name: 'fecha_fin', type: 'timestamptz' })
  fechaFin: Date

  @Column({ name: 'duracion_minutos', type: 'int' })
  duracionMinutos: number

  @Column({ name: 'titulo', length: 200 })
  titulo: string

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string

  @Column({ name: 'tipo_servicio', length: 100, nullable: true })
  tipoServicio?: string

  @Column({ name: 'estado_reserva', length: 20, default: EstadoReserva.CONFIRMADA })
  estadoReserva: string

  @Column({ name: 'notas_internas', type: 'text', nullable: true })
  notasInternas?: string

  @Column({ name: 'resultado', length: 30, nullable: true })
  resultado?: string

  /** Evita mandar el recordatorio de la llamada más de una vez. */
  @Column({ name: 'recordatorio_enviado', type: 'boolean', default: false })
  recordatorioEnviado: boolean

  constructor(data?: Partial<Reserva>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
