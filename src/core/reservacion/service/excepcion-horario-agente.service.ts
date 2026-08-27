import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ExcepcionHorarioAgente } from '../entity/excepcion-horario-agente.entity'
import { CreateExcepcionHorarioAgenteDto, UpdateExcepcionHorarioAgenteDto } from '../dto/excepcion-horario-agente.dto'
import { AgenteService } from '../../agente/service/agente.service'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion, TipoAgente } from '../../../common/constants'

@Injectable()
export class ExcepcionHorarioAgenteService extends BaseService {
  constructor(
    @InjectRepository(ExcepcionHorarioAgente)
    private readonly excepcionRepository: Repository<ExcepcionHorarioAgente>,
    private readonly agenteService: AgenteService,
  ) {
    super(ExcepcionHorarioAgenteService.name)
  }

  async listar(clienteId: string, filtros?: { agenteId?: string }): Promise<ExcepcionHorarioAgente[]> {
    const qb = this.excepcionRepository
      .createQueryBuilder('e')
      .where('e.clienteId = :clienteId', { clienteId })
      .andWhere('e.estado = :estado', { estado: Status.ACTIVE })
      .orderBy('e.fechaInicio', 'ASC')

    if (filtros?.agenteId) qb.andWhere('e.agenteId = :agenteId', { agenteId: filtros.agenteId })

    return qb.getMany()
  }

  /**
   * Excepciones que se solapan con [desde,hasta] y aplican a `agenteId` (si se pasa) o
   * a todo el equipo (`agenteId IS NULL`). Sin `agenteId`, solo trae las de equipo — no
   * tiene sentido pintar un bloqueo individual en una vista que no filtra por agente.
   */
  async listarEnRango(clienteId: string, desde: string, hasta: string, agenteId?: string): Promise<ExcepcionHorarioAgente[]> {
    const qb = this.excepcionRepository
      .createQueryBuilder('e')
      .where('e.clienteId = :clienteId', { clienteId })
      .andWhere('e.estado = :estado', { estado: Status.ACTIVE })
      .andWhere('e.fechaInicio <= :hasta', { hasta })
      .andWhere('e.fechaFin >= :desde', { desde })
      .orderBy('e.fechaInicio', 'ASC')

    if (agenteId) {
      qb.andWhere('(e.agenteId IS NULL OR e.agenteId = :agenteId)', { agenteId })
    } else {
      qb.andWhere('e.agenteId IS NULL')
    }

    return qb.getMany()
  }

  /** Solo mira bloqueos de DÍA COMPLETO (horaInicio/horaFin nulos) — los parciales los resuelve `obtenerBloqueosParciales`. */
  async estaBloqueada(agenteId: string, clienteId: string, fecha: string): Promise<{ bloqueada: boolean; motivo?: string }> {
    const excepciones = await this.listarEnRango(clienteId, fecha, fecha, agenteId)
    const diaCompleto = excepciones.find(e => !e.horaInicio && !e.horaFin)
    if (!diaCompleto) return { bloqueada: false }
    return { bloqueada: true, motivo: diaCompleto.motivo }
  }

  /** Franjas puntuales bloqueadas ese día (ej. un evento de Google Calendar) — no tumban el día completo. */
  async obtenerBloqueosParciales(agenteId: string, clienteId: string, fecha: string): Promise<{ horaInicio: string; horaFin: string; motivo: string }[]> {
    const excepciones = await this.listarEnRango(clienteId, fecha, fecha, agenteId)
    return excepciones
      .filter(e => e.horaInicio && e.horaFin)
      .map(e => ({ horaInicio: e.horaInicio as string, horaFin: e.horaFin as string, motivo: e.motivo }))
  }

  /** Upsert usado por el sondeo de Google Calendar — busca por googleEventId (no por id de excepción, que el sondeo no conoce). */
  async upsertDesdeGoogle(datos: {
    agenteId: string
    clienteId: string
    fecha: string
    horaInicio: string
    horaFin: string
    motivo: string
    googleEventId: string
    usuarioSistema: string
  }): Promise<void> {
    const existente = await this.excepcionRepository.findOne({
      where: { agenteId: datos.agenteId, clienteId: datos.clienteId, googleEventId: datos.googleEventId, estado: Status.ACTIVE },
    })
    if (existente) {
      Object.assign(existente, {
        fechaInicio: datos.fecha,
        fechaFin: datos.fecha,
        horaInicio: datos.horaInicio,
        horaFin: datos.horaFin,
        motivo: datos.motivo,
        transaccion: Transacccion.ACTUALIZAR,
        usuarioModificacion: datos.usuarioSistema,
      })
      await this.excepcionRepository.save(existente)
      return
    }

    const nueva = this.excepcionRepository.create({
      agenteId: datos.agenteId,
      clienteId: datos.clienteId,
      fechaInicio: datos.fecha,
      fechaFin: datos.fecha,
      horaInicio: datos.horaInicio,
      horaFin: datos.horaFin,
      motivo: datos.motivo,
      tipo: 'google_calendar',
      googleEventId: datos.googleEventId,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion: datos.usuarioSistema,
    })
    await this.excepcionRepository.save(nueva)
  }

  /** Llamado por el sondeo cuando un evento de Google se cancela — borra el bloqueo asociado, si existe. */
  async eliminarPorGoogleEventId(agenteId: string, clienteId: string, googleEventId: string, usuarioModificacion: string): Promise<void> {
    const existente = await this.excepcionRepository.findOne({
      where: { agenteId, clienteId, googleEventId, estado: Status.ACTIVE },
    })
    if (!existente) return
    existente.estado = Status.ELIMINATE
    existente.transaccion = Transacccion.ELIMINAR
    existente.usuarioModificacion = usuarioModificacion
    await this.excepcionRepository.save(existente)
  }

  async crear(dto: CreateExcepcionHorarioAgenteDto, usuarioCreacion: string, clienteId: string): Promise<ExcepcionHorarioAgente> {
    if (dto.fechaFin < dto.fechaInicio) {
      throw new BadRequestException('fechaFin debe ser igual o posterior a fechaInicio')
    }
    if (dto.agenteId) await this.validarAgenteHumano(dto.agenteId, clienteId)

    const excepcion = this.excepcionRepository.create({
      ...dto,
      agenteId: dto.agenteId || null,
      clienteId,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.excepcionRepository.save(excepcion)
  }

  async actualizar(
    id: string,
    dto: UpdateExcepcionHorarioAgenteDto,
    usuarioModificacion: string,
    clienteId: string,
  ): Promise<ExcepcionHorarioAgente> {
    const excepcion = await this.obtener(id, clienteId)

    const fechaInicio = dto.fechaInicio ?? excepcion.fechaInicio
    const fechaFin = dto.fechaFin ?? excepcion.fechaFin
    if (fechaFin < fechaInicio) {
      throw new BadRequestException('fechaFin debe ser igual o posterior a fechaInicio')
    }
    if (dto.agenteId) await this.validarAgenteHumano(dto.agenteId, clienteId)

    Object.assign(excepcion, dto, {
      agenteId: dto.agenteId !== undefined ? dto.agenteId || null : excepcion.agenteId,
      transaccion: Transacccion.ACTUALIZAR,
      usuarioModificacion,
    })
    return this.excepcionRepository.save(excepcion)
  }

  async eliminar(id: string, usuarioModificacion: string, clienteId: string): Promise<void> {
    const excepcion = await this.obtener(id, clienteId)
    excepcion.estado = Status.ELIMINATE
    excepcion.transaccion = Transacccion.ELIMINAR
    excepcion.usuarioModificacion = usuarioModificacion
    await this.excepcionRepository.save(excepcion)
  }

  private async obtener(id: string, clienteId: string): Promise<ExcepcionHorarioAgente> {
    const excepcion = await this.excepcionRepository.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!excepcion) throw new NotFoundException('Excepción de calendario no encontrada')
    return excepcion
  }

  private async validarAgenteHumano(agenteId: string, clienteId: string): Promise<void> {
    const agente = await this.agenteService.obtener(agenteId, clienteId)
    if (agente.tipoAgente !== TipoAgente.HUMANO) {
      throw new BadRequestException('Solo se pueden bloquear fechas de agentes humanos')
    }
  }
}
