import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between, In } from 'typeorm'
import { Reserva } from '../entity/reserva.entity'
import { CrearReservaDto } from '../dto/crear-reserva.dto'
import { ActualizarReservaDto } from '../dto/actualizar-reserva.dto'
import { FiltroExportacionDto } from '../dto/filtro-exportacion.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'

@Injectable()
export class ReservaService extends BaseService {
  constructor(
    @InjectRepository(Reserva)
    private readonly repo: Repository<Reserva>,
  ) {
    super(ReservaService.name)
  }

  async crear(dto: CrearReservaDto, clienteId: string, usuarioCreacion: string): Promise<Reserva> {
    const reserva = this.repo.create({
      ...dto,
      clienteId,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
      prioridad: dto.prioridad || 'media',
    })
    return this.repo.save(reserva)
  }

  async obtener(id: string, clienteId: string): Promise<Reserva> {
    const reserva = await this.repo.findOne({
      where: { id, clienteId, estado: Status.ACTIVE },
    })
    if (!reserva) throw new NotFoundException('Reserva no encontrada')
    return reserva
  }

  async listar(clienteId: string, filtros?: FiltroExportacionDto): Promise<Reserva[]> {
    const query = this.repo.createQueryBuilder('r').where('r.cliente_id = :clienteId', { clienteId }).andWhere('r._estado = :estado', { estado: Status.ACTIVE })

    if (filtros) {
      if (filtros.agenteId) {
        query.andWhere('r.agente_id = :agenteId', { agenteId: filtros.agenteId })
      }
      if (filtros.tipo) {
        query.andWhere('r.tipo = :tipo', { tipo: filtros.tipo })
      }
      if (filtros.fechaDesde || filtros.fechaHasta) {
        const desde = filtros.fechaDesde ? new Date(filtros.fechaDesde) : null
        const hasta = filtros.fechaHasta ? new Date(filtros.fechaHasta) : null
        if (desde && hasta) {
          query.andWhere('r.fecha_reserva BETWEEN :desde AND :hasta', { desde, hasta })
        } else if (desde) {
          query.andWhere('r.fecha_reserva >= :desde', { desde })
        } else if (hasta) {
          query.andWhere('r.fecha_reserva <= :hasta', { hasta })
        }
      }
      if (filtros.estados && filtros.estados.length > 0) {
        query.andWhere('r.estado IN (:...estados)', { estados: filtros.estados })
      }
      if (filtros.modalidades && filtros.modalidades.length > 0) {
        query.andWhere('r.modalidad IN (:...modalidades)', { modalidades: filtros.modalidades })
      }

      // Ordenamiento
      const ordenarPor = filtros.ordenarPor || 'r.fecha_reserva DESC'
      const [campo, direccion] = ordenarPor.split(' ')
      query.orderBy(campo || 'r.fecha_reserva', (direccion as 'ASC' | 'DESC') || 'DESC')
    } else {
      query.orderBy('r.fecha_reserva', 'DESC')
    }

    return query.getMany()
  }

  async actualizar(id: string, dto: ActualizarReservaDto, clienteId: string, usuarioModificacion: string): Promise<Reserva> {
    const reserva = await this.obtener(id, clienteId)
    Object.assign(reserva, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(reserva)
  }

  async cambiarEstado(id: string, nuevoEstado: string, clienteId: string, usuarioModificacion: string): Promise<void> {
    const reserva = await this.obtener(id, clienteId)
    const reservaParaActualizar = await this.repo.findOne({ where: { id } })
    if (reservaParaActualizar) {
      reservaParaActualizar.estado = nuevoEstado
      reservaParaActualizar.transaccion = Transacccion.ACTUALIZAR
      reservaParaActualizar.usuarioModificacion = usuarioModificacion
      await this.repo.save(reservaParaActualizar)
    }
  }

  async eliminar(id: string, clienteId: string, usuarioModificacion: string): Promise<void> {
    const reserva = await this.obtener(id, clienteId)
    const reservaParaEliminar = await this.repo.findOne({ where: { id } })
    if (reservaParaEliminar) {
      reservaParaEliminar.estado = Status.ELIMINATE
      reservaParaEliminar.transaccion = Transacccion.ELIMINAR
      reservaParaEliminar.usuarioModificacion = usuarioModificacion
      await this.repo.save(reservaParaEliminar)
    }
  }

  async obtenerPorConversacion(conversacionId: string, clienteId: string): Promise<Reserva | null> {
    return this.repo.findOne({
      where: { conversacionId, clienteId, estado: Status.ACTIVE },
    })
  }

  async listarPorAgente(agenteId: string, clienteId: string): Promise<Reserva[]> {
    return this.repo.find({
      where: { agenteId, clienteId, estado: Status.ACTIVE },
      order: { fechaReserva: 'DESC' },
    })
  }
}
