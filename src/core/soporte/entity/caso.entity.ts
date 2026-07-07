import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Cliente } from '../../cliente/entity/cliente.entity'
import { Conversacion } from '../../conversacion/entity/conversacion.entity'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'caso_soporte', schema: process.env.DB_SCHEMA || 'public' })
export class CasoSoporte extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'numero_caso', length: 50, unique: true })
  numeroCaso: string

  @Column({ name: 'titulo', length: 500 })
  titulo: string

  @Column({ name: 'descripcion', type: 'text' })
  descripcion: string

  @Column({ name: 'estado', length: 50, default: 'abierto' })
  estadoCaso: string

  @Column({ name: 'prioridad', length: 50, default: 'media' })
  prioridad: string

  @Column({ name: 'categoria', length: 100, nullable: true })
  categoria?: string

  @Column({ name: 'conversacion_id', type: 'bigint', nullable: true })
  conversacionId?: string

  @ManyToOne(() => Conversacion)
  @JoinColumn({ name: 'conversacion_id' })
  conversacion: Conversacion

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente

  @Column({ name: 'nombre_contacto', length: 200 })
  nombreContacto: string

  @Column({ name: 'email_contacto', length: 150, nullable: true })
  emailContacto?: string

  @Column({ name: 'telefono_contacto', length: 50, nullable: true })
  telefonoContacto?: string

  @Column({ name: 'asignado_a', type: 'bigint', nullable: true })
  asignadoA?: string

  @Column({ name: 'historial', type: 'jsonb', default: '[]' })
  historial: Array<{ timestamp: string; accion: string; usuario: string; detalles: string }>

  @Column({ name: 'fecha_resolucion', type: 'timestamptz', nullable: true })
  fechaResolucion?: Date

  constructor(data?: Partial<CasoSoporte>) {
    super()
    Object.assign(this, data)
  }
}
