import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { Cliente } from '../entity/cliente.entity'
import { CreateClienteDto, UpdateClienteDto } from '../dto/cliente.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'

export interface ResumenCliente {
  agentes: number
  conversaciones: number
  usuarios: number
  cuentasRedesSociales: number
  configuraciones: number
}

@Injectable()
export class ClienteService extends BaseService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super(ClienteService.name)
  }

  async listar(): Promise<Cliente[]> {
    return this.clienteRepository.find({
      where: { estado: Status.ACTIVE },
      order: { fechaCreacion: 'DESC' },
    })
  }

  async obtener(id: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ where: { id, estado: Status.ACTIVE } })
    if (!cliente) throw new NotFoundException(Messages.CLIENTE_NOT_FOUND)
    return cliente
  }

  async obtenerPorSlug(slug: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ where: { slug, estado: Status.ACTIVE } })
    if (!cliente) throw new NotFoundException(Messages.CLIENTE_NOT_FOUND)
    return cliente
  }

  async crear(dto: CreateClienteDto, usuarioCreacion: string): Promise<Cliente> {
    const existe = await this.clienteRepository.findOne({ where: { slug: dto.slug, estado: Status.ACTIVE } })
    if (existe) throw new ConflictException(`Ya existe un cliente con el slug '${dto.slug}'.`)

    const cliente = this.clienteRepository.create({
      ...dto,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
      activo: true,
      diasAtencion: dto.diasAtencion ?? [],
      servicios: dto.servicios ?? [],
    })
    return this.clienteRepository.save(cliente)
  }

  async actualizar(id: string, dto: UpdateClienteDto, usuarioModificacion: string): Promise<Cliente> {
    const cliente = await this.obtener(id)

    if (dto.slug && dto.slug !== cliente.slug) {
      const existe = await this.clienteRepository.findOne({ where: { slug: dto.slug, estado: Status.ACTIVE } })
      if (existe) throw new ConflictException(`Ya existe un cliente con el slug '${dto.slug}'.`)
    }

    Object.assign(cliente, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.clienteRepository.save(cliente)
  }

  async eliminar(id: string, usuarioModificacion: string): Promise<void> {
    const cliente = await this.obtener(id)
    cliente.estado = Status.ELIMINATE
    cliente.transaccion = Transacccion.ELIMINAR
    cliente.usuarioModificacion = usuarioModificacion
    await this.clienteRepository.save(cliente)
  }

  async resumen(id: string): Promise<ResumenCliente> {
    await this.obtener(id)
    const s = process.env.DB_SCHEMA || 'public'
    const act = Status.ACTIVE
    const [ag, conv, usr, rs, cfg] = await Promise.all([
      this.dataSource.query(`SELECT COUNT(*) FROM ${s}.agente WHERE cliente_id=$1 AND _estado=$2`, [id, act]),
      this.dataSource.query(`SELECT COUNT(*) FROM ${s}.conversacion WHERE cliente_id=$1 AND _estado=$2`, [id, act]),
      this.dataSource.query(`SELECT COUNT(*) FROM ${s}.usuario WHERE cliente_id=$1 AND _estado=$2`, [id, act]),
      this.dataSource.query(`SELECT COUNT(*) FROM ${s}.red_social_cuenta WHERE cliente_id=$1 AND _estado=$2`, [id, act]),
      this.dataSource.query(`SELECT COUNT(*) FROM ${s}.configuracion_cliente WHERE cliente_id=$1 AND _estado=$2`, [id, act]),
    ])
    return {
      agentes: parseInt(ag[0].count, 10),
      conversaciones: parseInt(conv[0].count, 10),
      usuarios: parseInt(usr[0].count, 10),
      cuentasRedesSociales: parseInt(rs[0].count, 10),
      configuraciones: parseInt(cfg[0].count, 10),
    }
  }
}
