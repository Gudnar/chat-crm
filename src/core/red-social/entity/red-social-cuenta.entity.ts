import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'
import { Cliente } from '../../cliente/entity/cliente.entity'

@Entity({ name: 'red_social_cuenta', schema: process.env.DB_SCHEMA || 'public' })
export class RedSocialCuenta extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'plataforma', length: 30 })
  plataforma: string // 'facebook' | 'instagram'

  @Column({ name: 'nombre', length: 200 })
  nombre: string

  @Column({ name: 'page_id', length: 100 })
  pageId: string // FB Page ID o IG Business Account ID

  @Column({ name: 'access_token', type: 'text', nullable: true })
  accessToken?: string

  @Column({ name: 'app_secret', length: 200, nullable: true })
  appSecret?: string

  @Column({ name: 'verify_token', length: 200, nullable: true, default: 'ide_ia_meta_token' })
  verifyToken?: string

  @Column({ name: 'agente_id', type: 'bigint', nullable: true })
  agenteId?: string

  @Column({ name: 'enabled', type: 'boolean', default: true })
  enabled: boolean

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente

  constructor(data?: Partial<RedSocialCuenta>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
