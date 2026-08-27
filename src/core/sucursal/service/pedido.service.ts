import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Pedido } from '../entity/pedido.entity'
import { CreatePedidoDto, UpdatePedidoEstadoDto, UpdatePedidoEstadoPagoDto } from '../dto/pedido.dto'
import { Sucursal } from '../entity/sucursal.entity'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'

@Injectable()
export class PedidoService extends BaseService {
  constructor(
    @InjectRepository(Pedido)
    private readonly repo: Repository<Pedido>,
    @InjectRepository(Sucursal)
    private readonly sucursalRepo: Repository<Sucursal>,
  ) {
    super(PedidoService.name)
  }

  async listarPorSucursal(sucursalId: string, estadoPedido?: string): Promise<Pedido[]> {
    const qb = this.repo.createQueryBuilder('p')
      .where('p.sucursalId = :sucursalId', { sucursalId })
      .andWhere('p.estado = :est', { est: Status.ACTIVE })

    if (estadoPedido) qb.andWhere('p.estadoPedido = :estadoPedido', { estadoPedido })

    return qb.orderBy('p.fechaConfirmacion', 'DESC').addOrderBy('p._fecha_creacion', 'DESC').getMany()
  }

  async obtener(id: string, clienteId: string): Promise<Pedido> {
    const p = await this.repo.findOne({
      where: { id, clienteId, estado: Status.ACTIVE },
    })
    if (!p) throw new NotFoundException('Pedido no encontrado')
    return p
  }

  async obtenerPorCodigo(codigoPedido: string, clienteId: string): Promise<Pedido> {
    const p = await this.repo.findOne({
      where: { codigoPedido, clienteId, estado: Status.ACTIVE },
    })
    if (!p) throw new NotFoundException('Pedido no encontrado')
    return p
  }

  async obtenerPorConversacion(conversacionId: string, clienteId: string): Promise<Pedido | null> {
    return this.repo.findOne({
      where: { conversacionId, clienteId, estado: Status.ACTIVE },
    })
  }

  async crear(clienteId: string, dto: CreatePedidoDto, usuarioCreacion: string): Promise<Pedido> {
    const sucursal = await this.sucursalRepo.findOne({
      where: { id: dto.sucursalId, clienteId, estado: Status.ACTIVE },
    })
    if (!sucursal) throw new NotFoundException('Sucursal no encontrada')

    // Generar codigoPedido: prefijo_sucursal + número secuencial
    const lastPedido = await this.repo
      .createQueryBuilder('p')
      .where('p.sucursalId = :sucursalId', { sucursalId: dto.sucursalId })
      .andWhere('p.clienteId = :clienteId', { clienteId })
      .orderBy('p._fecha_creacion', 'DESC')
      .getOne()

    let numeroConsecutivo = 1
    if (lastPedido && lastPedido.codigoPedido) {
      const match = lastPedido.codigoPedido.match(/-(\d+)$/)
      if (match) {
        numeroConsecutivo = parseInt(match[1], 10) + 1
      }
    }

    const codigoPedido = `${sucursal.codigo}-${String(numeroConsecutivo).padStart(5, '0')}`

    const pedido = this.repo.create({
      clienteId,
      ...dto,
      codigoPedido,
      estadoPedido: 'pendiente_confirmacion',
      estadoPago: 'pendiente',
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })

    return this.repo.save(pedido)
  }

  async cambiarEstado(
    id: string,
    clienteId: string,
    dto: UpdatePedidoEstadoDto,
    usuarioModificacion: string,
  ): Promise<Pedido> {
    const p = await this.obtener(id, clienteId)

    // Validar transición de estados
    const transicionesValidas: Record<string, string[]> = {
      pendiente_confirmacion: ['confirmado', 'cancelado'],
      confirmado: ['en_preparacion', 'cancelado'],
      en_preparacion: ['listo', 'cancelado'],
      listo: ['en_camino', 'cancelado'],
      en_camino: ['entregado', 'cancelado'],
      entregado: [],
      cancelado: [],
    }

    const estPrevio = p.estadoPedido
    if (!transicionesValidas[estPrevio]?.includes(dto.estadoPedido)) {
      throw new BadRequestException(
        `No se puede cambiar de "${estPrevio}" a "${dto.estadoPedido}"`,
      )
    }

    p.estadoPedido = dto.estadoPedido as any
    if (dto.estadoPedido === 'cancelado') {
      p.motivoCancelacion = dto.motivoCancelacion
    }

    // Setear fechas según estado
    if (dto.estadoPedido === 'confirmado') {
      p.fechaConfirmacion = new Date()
    } else if (dto.estadoPedido === 'listo') {
      p.fechaListo = new Date()
    } else if (dto.estadoPedido === 'entregado') {
      p.fechaEntrega = new Date()
    }

    p.transaccion = Transacccion.ACTUALIZAR
    p.usuarioModificacion = usuarioModificacion
    return this.repo.save(p)
  }

  async cambiarEstadoPago(
    id: string,
    clienteId: string,
    dto: UpdatePedidoEstadoPagoDto,
    usuarioModificacion: string,
  ): Promise<Pedido> {
    const p = await this.obtener(id, clienteId)
    p.estadoPago = dto.estadoPago as any
    p.transaccion = Transacccion.ACTUALIZAR
    p.usuarioModificacion = usuarioModificacion
    return this.repo.save(p)
  }

  async eliminar(id: string, clienteId: string, usuarioModificacion: string): Promise<void> {
    const p = await this.obtener(id, clienteId)
    p.estado = Status.ELIMINATE
    p.transaccion = Transacccion.ELIMINAR
    p.usuarioModificacion = usuarioModificacion
    await this.repo.save(p)
  }
}
