import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm'
import { Conversacion } from '../../conversacion/entity/conversacion.entity'
import { Agente } from '../../agente/entity/agente.entity'
import { Cliente } from '../../cliente/entity/cliente.entity'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'asignacion_agente_humano', schema: process.env.DB_SCHEMA || 'public' })
export class AsignacionAgenteHumano extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Index()
  @Column({ name: 'conversacion_id', type: 'bigint' })
  conversacionId: string

  @ManyToOne(() => Conversacion)
  @JoinColumn({ name: 'conversacion_id' })
  conversacion: Conversacion

  @Index()
  @Column({ name: 'agente_humano_id', type: 'bigint' })
  agenteHumanoId: string

  @ManyToOne(() => Agente)
  @JoinColumn({ name: 'agente_humano_id' })
  agenteHumano: Agente

  // Usuario que realizó la asignación (admin, supervisor o el propio agente)
  @Column({ name: 'asignado_por', type: 'bigint' })
  asignadoPor: string

  @Index()
  @Column({ name: 'fecha_asignacion', type: 'timestamptz', default: () => 'now()' })
  fechaAsignacion: Date

  @Column({ name: 'fecha_cierre', type: 'timestamptz', nullable: true })
  fechaCierre?: Date | null

  @Column({ name: 'razon_asignacion', length: 500, nullable: true })
  razonAsignacion?: string

  @Column({ name: 'fue_escalada', type: 'boolean', default: false })
  fueEscalada: boolean

  // 'activa' | 'cerrada' | 'reasignada'
  @Column({ name: 'estado_asignacion', length: 20, default: 'activa' })
  estadoAsignacion: string

  @Column({ name: 'tiempo_atencion_segundos', type: 'int', nullable: true })
  tiempoAtencionSegundos?: number | null

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente

  constructor(data?: Partial<AsignacionAgenteHumano>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
