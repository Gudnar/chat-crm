import {
  BeforeInsert,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Cliente } from '../../cliente/entity/cliente.entity'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'
import * as bcrypt from 'bcrypt'

@Entity({ name: 'usuario', schema: process.env.DB_SCHEMA || 'public' })
export class Usuario extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'usuario', length: 100, unique: true })
  usuario: string

  @Column({ name: 'contrasena', length: 255 })
  contrasena: string

  @Column({ name: 'correo_electronico', length: 150, nullable: true })
  correoElectronico?: string

  @Column({ name: 'nombres', length: 150 })
  nombres: string

  @Column({ name: 'apellidos', length: 150, nullable: true })
  apellidos?: string

  @Column({ name: 'rol', length: 50, default: 'USER' })
  rol: string

  @Column({ name: 'intentos', type: 'int', default: 0 })
  intentos: number

  @Column({ name: 'fecha_bloqueo', type: 'timestamp', nullable: true })
  fechaBloqueo?: Date | null

  @Column({ name: 'cliente_id', type: 'bigint', nullable: true })
  clienteId: string | null

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente | null

  @Column({ name: 'rol_cliente_id', type: 'bigint', nullable: true })
  rolClienteId: string | null

  @BeforeInsert()
  async hashPassword() {
    if (this.contrasena) {
      this.contrasena = await bcrypt.hash(this.contrasena, 10)
    }
  }

  constructor(data?: Partial<Usuario>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
