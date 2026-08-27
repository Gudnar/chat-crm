import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ClienteFinal } from '../entity/cliente-final.entity'
import { CreateClienteFinalDto, UpdateClienteFinalDto } from '../dto/cliente-final.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'

@Injectable()
export class ClienteFinalService extends BaseService {
  constructor(
    @InjectRepository(ClienteFinal)
    private readonly repo: Repository<ClienteFinal>,
  ) {
    super(ClienteFinalService.name)
  }

  async listarPorCliente(clienteId: string, sucursalId?: string): Promise<ClienteFinal[]> {
    const where: any = { clienteId, estado: Status.ACTIVE }
    if (sucursalId) where.sucursalId = sucursalId

    return this.repo.find({
      where,
      order: { nombre: 'ASC' },
    })
  }

  async obtener(id: string, clienteId: string): Promise<ClienteFinal> {
    const c = await this.repo.findOne({
      where: { id, clienteId, estado: Status.ACTIVE },
    })
    if (!c) throw new NotFoundException('Cliente final no encontrado')
    return c
  }

  async buscarPorTelefono(clienteId: string, telefono: string): Promise<ClienteFinal | null> {
    return this.repo.findOne({
      where: { clienteId, telefono, estado: Status.ACTIVE },
    })
  }

  async crear(clienteId: string, dto: CreateClienteFinalDto, usuarioCreacion: string): Promise<ClienteFinal> {
    const cliente = this.repo.create({
      clienteId,
      ...dto,
      direcciones: dto.direcciones || [],
      totalPedidos: 0,
      totalGastado: 0,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.repo.save(cliente)
  }

  async actualizar(id: string, clienteId: string, dto: UpdateClienteFinalDto, usuarioModificacion: string): Promise<ClienteFinal> {
    const c = await this.obtener(id, clienteId)
    Object.assign(c, dto, { transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(c)
  }

  async eliminar(id: string, clienteId: string, usuarioModificacion: string): Promise<void> {
    const c = await this.obtener(id, clienteId)
    c.estado = Status.ELIMINATE
    c.transaccion = Transacccion.ELIMINAR
    c.usuarioModificacion = usuarioModificacion
    await this.repo.save(c)
  }

  async registrarCompra(id: string, clienteId: string, monto: number, usuarioModificacion: string): Promise<ClienteFinal> {
    const c = await this.obtener(id, clienteId)
    c.totalPedidos += 1
    c.totalGastado = Number(c.totalGastado) + monto
    c.ultimaCompra = new Date()
    c.transaccion = Transacccion.ACTUALIZAR
    c.usuarioModificacion = usuarioModificacion
    return this.repo.save(c)
  }
}
