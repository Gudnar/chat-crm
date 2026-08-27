import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'
import { ConfiguracionCliente } from './configuracion-cliente.entity'

@Entity({ name: 'cliente', schema: process.env.DB_SCHEMA || 'public' })
export class Cliente extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'nombre', length: 200 })
  nombre: string

  @Column({ name: 'slug', length: 100, unique: true })
  slug: string

  @Column({ name: 'logo_url', length: 500, nullable: true })
  logoUrl?: string

  @Column({ name: 'correo_contacto', length: 150, nullable: true })
  correoContacto?: string

  @Column({ name: 'telefono', length: 30, nullable: true })
  telefono?: string

  @Column({ name: 'plan', length: 30, default: 'basico' })
  plan: string

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  @Column({ name: 'dias_atencion', type: 'jsonb', default: '[]' })
  diasAtencion: string[]

  @Column({ name: 'hora_inicio_atencion', length: 5, nullable: true })
  horaInicioAtencion?: string

  @Column({ name: 'hora_fin_atencion', length: 5, nullable: true })
  horaFinAtencion?: string

  @Column({ name: 'horarios', type: 'jsonb', nullable: true, default: '[]' })
  horarios: { dia: string; franjas: { inicio: string; fin: string }[] }[]

  @Column({ name: 'servicios', type: 'jsonb', default: '[]' })
  servicios: string[]

  @Column({ name: 'metadatos', type: 'jsonb', nullable: true })
  metadatos?: Record<string, any>

  /** Tienda online pública en /tienda/:slug — apagada por defecto hasta que el cliente la active. */
  @Column({ name: 'tienda_activa', type: 'boolean', default: false })
  tiendaActiva: boolean

  @Column({ name: 'tienda_portada_url', length: 500, nullable: true })
  tiendaPortadaUrl?: string

  @Column({ name: 'tienda_color_primario', length: 20, default: '#2563eb' })
  tiendaColorPrimario: string

  @OneToMany(() => ConfiguracionCliente, c => c.cliente)
  configuraciones: ConfiguracionCliente[]

  constructor(data?: Partial<Cliente>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
