import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'
import { Cliente } from '../../cliente/entity/cliente.entity'

@Entity({ name: 'red_social_post', schema: process.env.DB_SCHEMA || 'public' })
export class RedSocialPost extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id!: string

  @Column({ name: 'plataforma', length: 30 })
  plataforma!: string // 'facebook' | 'instagram'

  @Column({ name: 'post_id', length: 200 })
  postId!: string // ID real del post en FB/IG

  @Column({ name: 'titulo', length: 500 })
  titulo!: string

  @Column({ name: 'contenido', type: 'text', nullable: true })
  contenido?: string // Texto completo del post

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl?: string // URL de la imagen/thumbnail

  @Column({ name: 'tipo', length: 30, nullable: true, default: 'post' })
  tipo?: string // 'post' | 'reel' | 'video' | 'photo'

  @Column({ name: 'likes', type: 'int', default: 0 })
  likes!: number

  @Column({ name: 'comentarios', type: 'int', default: 0 })
  comentarios!: number

  @Column({ name: 'compartidos', type: 'int', default: 0 })
  compartidos!: number

  @Column({ name: 'alcance', type: 'int', default: 0 })
  alcance!: number

  @Column({ name: 'fecha_post', type: 'timestamp', nullable: true })
  fechaPost?: Date // Fecha original del post en la plataforma

  @Column({ name: 'comentarios_data', type: 'jsonb', nullable: true, default: [] })
  comentariosData?: Array<{
    id: string
    message: string
    fromName: string
    fromId: string
    createdTime: string
  }>

  @Column({ name: 'agente_id', type: 'bigint', nullable: true })
  agenteId?: string

  @Column({ name: 'cuenta_id', type: 'bigint', nullable: true })
  cuentaId?: string

  @Column({ name: 'enabled', type: 'boolean', default: true })
  enabled!: boolean

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId!: string

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: Cliente

  constructor(data?: Partial<RedSocialPost>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
