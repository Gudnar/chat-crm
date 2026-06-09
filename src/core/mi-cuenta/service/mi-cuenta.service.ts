import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { Usuario } from '../../usuario/entity/usuario.entity'
import { Cliente } from '../../cliente/entity/cliente.entity'
import { RolCliente, PermisosRol } from '../entity/rol-cliente.entity'
import { Status, Transacccion, Roles } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import {
  UpdateMiCuentaDto,
  CreateUsuarioClienteDto,
  UpdateUsuarioClienteDto,
  CreateRolClienteDto,
  UpdateRolClienteDto,
} from '../dto/mi-cuenta.dto'

const PERMISOS_ADMIN: PermisosRol = {
  agentes:        { ver: true,  crear: true,  editar: true,  eliminar: true  },
  herramientas:   { ver: true,  gestionar: true  },
  conversaciones: { ver: true,  responder: true  },
  reportes:       { ver: true  },
  configuracion:  { ver: true,  editar: true  },
}

const PERMISOS_COLABORADOR: PermisosRol = {
  agentes:        { ver: true,  crear: false, editar: false, eliminar: false },
  herramientas:   { ver: true,  gestionar: false },
  conversaciones: { ver: true,  responder: true  },
  reportes:       { ver: true  },
  configuracion:  { ver: false, editar: false },
}

@Injectable()
export class MiCuentaService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(RolCliente)
    private readonly rolRepo: Repository<RolCliente>,
  ) {}

  // ── Empresa ──────────────────────────────────────────────────────────────

  async obtenerCliente(clienteId: string): Promise<Cliente> {
    const cliente = await this.clienteRepo.findOne({
      where: { id: clienteId, estado: Status.ACTIVE },
    })
    if (!cliente) throw new NotFoundException(Messages.CLIENTE_NOT_FOUND)
    return cliente
  }

  async actualizarCliente(clienteId: string, dto: UpdateMiCuentaDto, usuarioModificacion: string): Promise<Cliente> {
    const cliente = await this.obtenerCliente(clienteId)
    Object.assign(cliente, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.clienteRepo.save(cliente)
  }

  // ── Roles ─────────────────────────────────────────────────────────────────

  async listarRoles(clienteId: string): Promise<RolCliente[]> {
    return this.rolRepo.find({
      where: { clienteId, estado: Status.ACTIVE },
      order: { fechaCreacion: 'ASC' },
    })
  }

  async obtenerRol(clienteId: string, id: string): Promise<RolCliente> {
    const rol = await this.rolRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!rol) throw new NotFoundException('El rol no fue encontrado.')
    return rol
  }

  async crearRol(clienteId: string, dto: CreateRolClienteDto, usuarioCreacion: string): Promise<RolCliente> {
    const existe = await this.rolRepo.findOne({
      where: { clienteId, nombre: dto.nombre, estado: Status.ACTIVE },
    })
    if (existe) throw new ConflictException(`Ya existe un rol con el nombre "${dto.nombre}".`)

    const rol = this.rolRepo.create({
      clienteId,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      permisos: dto.permisos ?? {},
      esBase: false,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.rolRepo.save(rol)
  }

  async actualizarRol(clienteId: string, id: string, dto: UpdateRolClienteDto, usuarioModificacion: string): Promise<RolCliente> {
    const rol = await this.obtenerRol(clienteId, id)

    if (dto.nombre && dto.nombre !== rol.nombre) {
      const existe = await this.rolRepo.findOne({
        where: { clienteId, nombre: dto.nombre, estado: Status.ACTIVE },
      })
      if (existe) throw new ConflictException(`Ya existe un rol con el nombre "${dto.nombre}".`)
    }

    Object.assign(rol, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.rolRepo.save(rol)
  }

  async eliminarRol(clienteId: string, id: string, usuarioModificacion: string): Promise<void> {
    const rol = await this.obtenerRol(clienteId, id)
    if (rol.esBase) throw new ForbiddenException('Los roles base no pueden eliminarse.')

    // Desvincular usuarios que tenían este rol
    await this.usuarioRepo
      .createQueryBuilder()
      .update(Usuario)
      .set({ rolClienteId: null } as any)
      .where('rol_cliente_id = :id AND cliente_id = :clienteId', { id, clienteId })
      .execute()

    Object.assign(rol, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.rolRepo.save(rol)
  }

  async crearRolesBase(clienteId: string, usuarioCreacion: string): Promise<void> {
    const roles = [
      { nombre: 'Administrador', descripcion: 'Acceso completo a todos los módulos', permisos: PERMISOS_ADMIN,       esBase: true },
      { nombre: 'Colaborador',   descripcion: 'Acceso limitado de solo lectura y respuesta', permisos: PERMISOS_COLABORADOR, esBase: true },
    ]
    for (const r of roles) {
      const existe = await this.rolRepo.findOne({ where: { clienteId, nombre: r.nombre } })
      if (!existe) {
        await this.rolRepo.save(this.rolRepo.create({
          ...r, clienteId,
          estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion,
        }))
      }
    }
  }

  async contarUsuariosPorRol(clienteId: string): Promise<Record<string, number>> {
    const rows = await this.usuarioRepo
      .createQueryBuilder('u')
      .select('u.rolClienteId', 'rolId')
      .addSelect('COUNT(*)', 'total')
      .where('u.clienteId = :clienteId AND u._estado = :estado AND u.rolClienteId IS NOT NULL', {
        clienteId, estado: Status.ACTIVE,
      })
      .groupBy('u.rolClienteId')
      .getRawMany()

    return rows.reduce((acc, r) => { acc[r.rolId] = Number(r.total); return acc }, {})
  }

  // ── Usuarios ──────────────────────────────────────────────────────────────

  async listarUsuarios(clienteId: string): Promise<any[]> {
    const usuarios = await this.usuarioRepo.find({
      where: { clienteId, estado: Status.ACTIVE },
    })
    const roles = await this.listarRoles(clienteId)
    const rolesMap = Object.fromEntries(roles.map(r => [r.id, r.nombre]))

    return usuarios.map(({ contrasena, ...rest }) => ({
      ...rest,
      rolClienteNombre: rest.rolClienteId ? (rolesMap[rest.rolClienteId] ?? null) : null,
    }))
  }

  async crearUsuario(clienteId: string, dto: CreateUsuarioClienteDto, usuarioCreacion: string): Promise<any> {
    const existe = await this.usuarioRepo.findOne({ where: { usuario: dto.usuario } })
    if (existe) throw new ConflictException(Messages.CONFLICT)

    if (dto.rolClienteId) await this.obtenerRol(clienteId, dto.rolClienteId)

    const nuevo = this.usuarioRepo.create({
      ...dto,
      clienteId,
      rol: dto.rol || Roles.COLABORADOR,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    const saved = await this.usuarioRepo.save(nuevo)
    const { contrasena, ...rest } = saved
    return rest
  }

  async actualizarUsuario(clienteId: string, id: string, dto: UpdateUsuarioClienteDto, usuarioModificacion: string): Promise<any> {
    const usuario = await this.usuarioRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!usuario) throw new NotFoundException(Messages.NOT_FOUND)

    if (dto.rolClienteId) await this.obtenerRol(clienteId, dto.rolClienteId)

    const actualizado: Partial<Usuario> = { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion }

    if (dto.contrasena) {
      actualizado.contrasena = await bcrypt.hash(dto.contrasena, 10)
    } else {
      delete (actualizado as any).contrasena
    }

    Object.assign(usuario, actualizado)
    const saved = await this.usuarioRepo.save(usuario)
    const { contrasena, ...rest } = saved
    return rest
  }

  async eliminarUsuario(clienteId: string, id: string, usuarioModificacion: string): Promise<void> {
    const usuario = await this.usuarioRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!usuario) throw new NotFoundException(Messages.NOT_FOUND)
    if (id === usuarioModificacion) throw new ForbiddenException('No puedes eliminar tu propio usuario.')

    Object.assign(usuario, { estado: Status.ELIMINATE, transaccion: Transacccion.ELIMINAR, usuarioModificacion })
    await this.usuarioRepo.save(usuario)
  }
}
