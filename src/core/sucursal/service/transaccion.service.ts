import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Transaccion } from '../entity/transaccion.entity'
import { CreateTransaccionDto } from '../dto/transaccion.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'

@Injectable()
export class TransaccionService extends BaseService {
  constructor(
    @InjectRepository(Transaccion)
    private readonly repo: Repository<Transaccion>,
  ) {
    super(TransaccionService.name)
  }

  async listarPorSucursal(sucursalId: string, desde?: Date, hasta?: Date): Promise<Transaccion[]> {
    let qb = this.repo.createQueryBuilder('t')
      .where('t.sucursalId = :sucursalId', { sucursalId })
      .andWhere('t.estado = :estado', { estado: Status.ACTIVE })

    if (desde) qb = qb.andWhere('t.fecha >= :desde', { desde })
    if (hasta) qb = qb.andWhere('t.fecha <= :hasta', { hasta })

    return qb.orderBy('t.fecha', 'DESC').getMany()
  }

  async listarPorCaja(cajaSucursalId: string): Promise<Transaccion[]> {
    const qb = this.repo.createQueryBuilder('t')
      .where('t.cajaSucursalId = :cajaSucursalId', { cajaSucursalId })
      .andWhere('t.estado = :est', { est: Status.ACTIVE })
      .orderBy('t.fecha', 'DESC')
    return qb.getMany()
  }

  async crear(clienteId: string, sucursalId: string, dto: CreateTransaccionDto, usuarioCreacion: string): Promise<Transaccion> {
    const fecha = dto.fecha || new Date()

    const transaccion = new Transaccion({
      clienteId,
      sucursalId,
      tipo: dto.tipo as any,
      metodoPago: dto.metodoPago as any,
      monto: dto.monto,
      pedidoId: dto.pedidoId,
      cajaSucursalId: dto.cajaSucursalId,
      referencia: dto.referencia,
      descripcion: dto.descripcion,
      fecha,
      estadoTransaccion: 'confirmado' as any,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })

    return this.repo.save(transaccion)
  }

  async calcularTotalPorCaja(cajaSucursalId: string): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('t')
      .select('SUM(t.monto)', 'total')
      .where('t.cajaSucursalId = :cajaSucursalId', { cajaSucursalId })
      .andWhere('t.estado = :estado', { estado: Status.ACTIVE })
      .andWhere('t.tipo IN (:...tipos)', { tipos: ['venta', 'ingreso_manual'] })
      .getRawOne()

    return result?.total ? Number(result.total) : 0
  }

  async calcularEgresosPorCaja(cajaSucursalId: string): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('t')
      .select('SUM(t.monto)', 'total')
      .where('t.cajaSucursalId = :cajaSucursalId', { cajaSucursalId })
      .andWhere('t.estado = :estado', { estado: Status.ACTIVE })
      .andWhere('t.tipo IN (:...tipos)', { tipos: ['gasto', 'reembolso'] })
      .getRawOne()

    return result?.total ? Number(result.total) : 0
  }
}
