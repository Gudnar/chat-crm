import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Usuario } from '../entity/usuario.entity'
import { CreateUsuarioDto } from '../dto/create-usuario.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'

@Injectable()
export class UsuarioService extends BaseService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>
  ) {
    super(UsuarioService.name)
  }

  async buscarUsuario(usuario: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { usuario, estado: Status.ACTIVE } })
  }

  async buscarUsuarioId(id: string): Promise<Partial<Usuario> | null> {
    const user = await this.usuarioRepository.findOne({ where: { id } })
    if (!user) return null
    const { contrasena, ...rest } = user
    return rest
  }

  async listar(): Promise<Usuario[]> {
    return this.usuarioRepository.find({ where: { estado: Status.ACTIVE } })
  }

  async crear(dto: CreateUsuarioDto, usuarioCreacion: string): Promise<Usuario> {
    const existe = await this.usuarioRepository.findOne({ where: { usuario: dto.usuario } })
    if (existe) throw new ConflictException(Messages.CONFLICT)

    const nuevo = this.usuarioRepository.create({
      ...dto,
      rol: dto.rol || 'USER',
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.usuarioRepository.save(nuevo)
  }

  async actualizarContadorBloqueos(id: string, intentos: number): Promise<void> {
    await this.usuarioRepository.update(id, { intentos })
  }

  async actualizarDatosBloqueo(id: string, codigo: string | null, fecha: any): Promise<void> {
    await this.usuarioRepository.update(id, { fechaBloqueo: fecha, intentos: 0 })
  }
}
