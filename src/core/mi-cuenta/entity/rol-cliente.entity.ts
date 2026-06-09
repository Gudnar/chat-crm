import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'
import { Cliente } from '../../cliente/entity/cliente.entity'

export interface PermisosRol {
  agentes?:        { ver?: boolean; crear?: boolean; editar?: boolean; eliminar?: boolean }
  herramientas?:   { ver?: boolean; gestionar?: boolean }
  conversaciones?: { ver?: boolean; responder?: boolean }
  reportes?:       { ver?: boolean }
  configuracion?:  { ver?: boolean; editar?: boolean }
}

@Entity({ name: 'rol_cliente', schema: process.env.DB_SCHEMA || 'public' })
export class RolCliente extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @Column({ name: 'nombre', length: 100 })
  nombre: string

  @Column({ name: 'descripcion', length: 255, nullable: true })
  descripcion?: string

  @Column({ name: 'permisos', type: 'jsonb', default: '{}' })
  permisos: PermisosRol

  @Column({ name: 'es_base', type: 'boolean', default: false })
  esBase: boolean

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente

  constructor(data?: Partial<RolCliente>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
