import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, MoreThanOrEqual, LessThanOrEqual, Repository } from 'typeorm'
import { PromocionTienda } from '../entity/promocion-tienda.entity'
import { CreatePromocionTiendaDto, UpdatePromocionTiendaDto } from '../dto/promocion-tienda.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'
import { fechaHoraBoliviaAUtc } from '../../../common/lib/fecha-bolivia.util'

@Injectable()
export class PromocionTiendaService extends BaseService {
  constructor(
    @InjectRepository(PromocionTienda)
    private readonly repo: Repository<PromocionTienda>,
  ) {
    super(PromocionTiendaService.name)
  }

  async listar(clienteId: string): Promise<PromocionTienda[]> {
    return this.repo.find({ where: { clienteId, estado: Status.ACTIVE }, order: { fechaInicio: 'DESC' } })
  }

  async obtener(id: string, clienteId: string): Promise<PromocionTienda> {
    const promo = await this.repo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!promo) throw new NotFoundException('Promoción no encontrada')
    return promo
  }

  /**
   * La promo vigente para un artículo en ESTE momento — activa, dentro de su rango de
   * fechas, y aplicable a la sucursal actual (sin sucursal propia = vale en todas).
   * Si hay una promo scoped a ESA sucursal y otra global, gana la scoped (más específica).
   */
  async obtenerVigente(articuloId: string, clienteId: string, sucursalId?: string): Promise<PromocionTienda | null> {
    const ahora = new Date()
    const base = { articuloId, clienteId, activo: true, estado: Status.ACTIVE, fechaInicio: LessThanOrEqual(ahora), fechaFin: MoreThanOrEqual(ahora) }
    const where = sucursalId ? [{ ...base, sucursalId }, { ...base, sucursalId: IsNull() }] : [{ ...base, sucursalId: IsNull() }]
    const candidatas = await this.repo.find({ where, order: { fechaInicio: 'DESC' } })
    return candidatas.find(p => p.sucursalId === sucursalId) || candidatas.find(p => !p.sucursalId) || null
  }

  /** Todas las promos vigentes de un cliente en un solo query, para no hacer N+1 al listar el catálogo. */
  async obtenerVigentesPorCliente(clienteId: string, sucursalId?: string): Promise<PromocionTienda[]> {
    const ahora = new Date()
    const base = { clienteId, activo: true, estado: Status.ACTIVE, fechaInicio: LessThanOrEqual(ahora), fechaFin: MoreThanOrEqual(ahora) }
    const where = sucursalId ? [{ ...base, sucursalId }, { ...base, sucursalId: IsNull() }] : [{ ...base, sucursalId: IsNull() }]
    return this.repo.find({ where })
  }

  async crear(dto: CreatePromocionTiendaDto, clienteId: string, usuarioCreacion: string): Promise<PromocionTienda> {
    const fechaInicio = fechaHoraBoliviaAUtc(dto.fechaInicio)
    const fechaFin = fechaHoraBoliviaAUtc(dto.fechaFin)
    if (Number.isNaN(fechaInicio.getTime()) || Number.isNaN(fechaFin.getTime())) {
      throw new BadRequestException('fechaInicio/fechaFin inválidas')
    }
    if (fechaFin <= fechaInicio) {
      throw new BadRequestException('fechaFin debe ser posterior a fechaInicio')
    }

    const promo = this.repo.create({
      clienteId,
      articuloId: dto.articuloId,
      sucursalId: dto.sucursalId || null,
      precioPromocional: dto.precioPromocional,
      fechaInicio, fechaFin,
      activo: true,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.repo.save(promo)
  }

  async actualizar(id: string, dto: UpdatePromocionTiendaDto, clienteId: string, usuarioModificacion: string): Promise<PromocionTienda> {
    const promo = await this.obtener(id, clienteId)
    const fechaInicio = dto.fechaInicio ? fechaHoraBoliviaAUtc(dto.fechaInicio) : promo.fechaInicio
    const fechaFin = dto.fechaFin ? fechaHoraBoliviaAUtc(dto.fechaFin) : promo.fechaFin
    if (fechaFin <= fechaInicio) {
      throw new BadRequestException('fechaFin debe ser posterior a fechaInicio')
    }

    Object.assign(promo, {
      sucursalId: dto.sucursalId !== undefined ? (dto.sucursalId || null) : promo.sucursalId,
      precioPromocional: dto.precioPromocional ?? promo.precioPromocional,
      fechaInicio, fechaFin,
      activo: dto.activo ?? promo.activo,
      transaccion: Transacccion.ACTUALIZAR,
      usuarioModificacion,
    })
    return this.repo.save(promo)
  }

  async eliminar(id: string, clienteId: string, usuarioModificacion: string): Promise<void> {
    const promo = await this.obtener(id, clienteId)
    promo.estado = Status.ELIMINATE
    promo.transaccion = Transacccion.ELIMINAR
    promo.usuarioModificacion = usuarioModificacion
    await this.repo.save(promo)
  }
}
