import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity('reserva')
export class Reserva extends AuditoriaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'cliente_id' })
  clienteId: string

  @Column({ name: 'agente_id' })
  agenteId: string

  @Column({ name: 'conversacion_id', nullable: true })
  conversacionId: string

  // Datos del contacto
  @Column({ name: 'contacto_nombre', nullable: true })
  contactoNombre: string

  @Column({ name: 'contacto_telefono', nullable: true })
  contactoTelefono: string

  @Column({ name: 'contacto_ubicacion', type: 'jsonb', nullable: true })
  contactoUbicacion: {
    latitud?: number
    longitud?: number
    direccion?: string
    barrio?: string
  }

  // Datos de la reserva
  @Column({ name: 'tipo' })
  tipo: string // "huesos", "vehiculo", "servicio", etc.

  @Column({ name: 'modalidad', nullable: true })
  modalidad: string // "delivery", "acopio", "presencial", etc.

  // Cantidad
  @Column({ name: 'cantidad_valor', type: 'numeric', nullable: true })
  cantidadValor: number

  @Column({ name: 'cantidad_unidad', nullable: true })
  cantidadUnidad: string // "kg", "m3", "unidades", "bolsas", etc.

  // Precio
  @Column({ name: 'precio_unitario', type: 'numeric', nullable: true })
  precioUnitario: number

  @Column({ name: 'precio_total', type: 'numeric', nullable: true })
  precioTotal: number

  // Fechas y horarios
  @Column({ name: 'fecha_reserva', type: 'date', nullable: true })
  fechaReserva: Date

  @Column({ name: 'hora_reserva', type: 'time', nullable: true })
  horaReserva: string

  @Column({ name: 'codigo_reserva', nullable: true })
  codigoReserva: string

  @Column({ name: 'duracion_minutos', nullable: true })
  duracionMinutos: number

  // Metadatos
  @Column({ name: 'prioridad', nullable: true })
  prioridad: string // "alta", "media", "baja"

  @Column({ name: 'estado', default: 'pendiente_confirmacion' })
  estado: string // "pendiente_confirmacion", "confirmado", "completado", "cancelado"

  @Column({ name: 'notas', type: 'text', nullable: true })
  notas: string

  @Column({ name: 'foto_url', nullable: true })
  fotoUrl: string

  // Atributos personalizados por agente
  @Column({ name: 'atributos_custom', type: 'jsonb', nullable: true })
  atributosCustom: Record<string, any>
}
