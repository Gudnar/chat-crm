import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Not, Repository } from 'typeorm'
import { Agente } from '../../agente/entity/agente.entity'
import { Reserva } from '../entity/reserva.entity'
import { CreateReservaDto, UpdateReservaDto, ActualizarEstadoReservaDto } from '../dto/reserva.dto'
import { ServicioAgenteService } from './servicio-agente.service'
import { HorarioAgenteService } from './horario-agente.service'
import { AgenteService } from '../../agente/service/agente.service'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion, TipoAgente, EstadoReserva } from '../../../common/constants'

export interface FiltrosReserva {
  agenteId?: string
  estado?: string
  desde?: string
  hasta?: string
}

@Injectable()
export class ReservacionService extends BaseService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
    private readonly servicioAgenteService: ServicioAgenteService,
    private readonly horarioAgenteService: HorarioAgenteService,
    private readonly agenteService: AgenteService,
  ) {
    super(ReservacionService.name)
  }

  async listar(clienteId: string, filtros?: FiltrosReserva): Promise<Reserva[]> {
    const where: any = { clienteId, estado: Status.ACTIVE }
    if (filtros?.agenteId) where.agenteId = filtros.agenteId
    if (filtros?.estado) where.estadoReserva = filtros.estado

    const reservas = await this.reservaRepository.find({ where, order: { fechaInicio: 'ASC' } })

    const desde = filtros?.desde ? new Date(filtros.desde) : null
    const hasta = filtros?.hasta ? new Date(filtros.hasta) : null
    return reservas.filter(r => (!desde || r.fechaInicio >= desde) && (!hasta || r.fechaInicio <= hasta))
  }

  async obtener(id: string, clienteId: string): Promise<Reserva> {
    const reserva = await this.reservaRepository.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!reserva) throw new NotFoundException('Reserva no encontrada')
    return reserva
  }

  async crear(dto: CreateReservaDto, usuarioCreacion: string, clienteId: string): Promise<Reserva> {
    const agente = await this.agenteService.obtener(dto.agenteId, clienteId)
    if (!agente.activo) throw new BadRequestException('El agente no está activo')

    let duracionMinutos = dto.duracionMinutos
    if (!duracionMinutos && dto.servicioAgenteId) {
      const servicio = await this.servicioAgenteService.obtener(dto.servicioAgenteId, clienteId)
      duracionMinutos = servicio.duracionMinutos
    }
    duracionMinutos = duracionMinutos || 30

    const fechaInicio = new Date(dto.fechaInicio)
    if (Number.isNaN(fechaInicio.getTime())) throw new BadRequestException('fechaInicio inválida')
    const fechaFin = new Date(fechaInicio.getTime() + duracionMinutos * 60000)

    // Los agentes humanos tienen agenda real: se valida horario laboral y solapamiento.
    // Los agentes IA son flexibles (conversación es stateless, sin límite de "agenda").
    if (agente.tipoAgente === TipoAgente.HUMANO) {
      await this.validarDentroDeHorario(dto.agenteId, clienteId, fechaInicio, fechaFin)
      await this.validarSinSolapamiento(dto.agenteId, clienteId, fechaInicio, fechaFin)
    }

    const reserva = this.reservaRepository.create({
      agenteId: dto.agenteId,
      tipoAgenteReserva: agente.tipoAgente,
      servicioAgenteId: dto.servicioAgenteId,
      conversacionId: dto.conversacionId,
      contactoNombre: dto.contactoNombre,
      contactoTelefono: dto.contactoTelefono,
      contactoEmail: dto.contactoEmail,
      fechaInicio,
      fechaFin,
      duracionMinutos,
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      tipoServicio: dto.tipoServicio,
      estadoReserva: EstadoReserva.CONFIRMADA,
      clienteId,
      codigoReserva: await this.generarCodigoReserva(clienteId),
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })

    return this.reservaRepository.save(reserva)
  }

  async actualizar(id: string, dto: UpdateReservaDto, usuarioModificacion: string, clienteId: string): Promise<Reserva> {
    const reserva = await this.obtener(id, clienteId)

    let fechaInicio = reserva.fechaInicio
    let duracionMinutos = dto.duracionMinutos ?? reserva.duracionMinutos
    if (dto.fechaInicio) {
      fechaInicio = new Date(dto.fechaInicio)
      if (Number.isNaN(fechaInicio.getTime())) throw new BadRequestException('fechaInicio inválida')
    }
    const fechaFin = new Date(fechaInicio.getTime() + duracionMinutos * 60000)

    if (dto.fechaInicio || dto.duracionMinutos) {
      if (reserva.tipoAgenteReserva === TipoAgente.HUMANO) {
        await this.validarDentroDeHorario(reserva.agenteId, clienteId, fechaInicio, fechaFin)
        await this.validarSinSolapamiento(reserva.agenteId, clienteId, fechaInicio, fechaFin, reserva.id)
      }
    }

    Object.assign(reserva, {
      fechaInicio,
      fechaFin,
      duracionMinutos,
      titulo: dto.titulo ?? reserva.titulo,
      descripcion: dto.descripcion ?? reserva.descripcion,
      notasInternas: dto.notasInternas ?? reserva.notasInternas,
      transaccion: Transacccion.ACTUALIZAR,
      usuarioModificacion,
    })
    return this.reservaRepository.save(reserva)
  }

  async actualizarEstado(
    id: string,
    dto: ActualizarEstadoReservaDto,
    usuarioModificacion: string,
    clienteId: string,
  ): Promise<Reserva> {
    const reserva = await this.obtener(id, clienteId)
    Object.assign(reserva, {
      estadoReserva: dto.estado,
      resultado: dto.resultado ?? reserva.resultado,
      notasInternas: dto.notasInternas ?? reserva.notasInternas,
      transaccion: Transacccion.ACTUALIZAR,
      usuarioModificacion,
    })
    return this.reservaRepository.save(reserva)
  }

  /** Slots "HH:mm" disponibles para agendar, descontando reservas ya confirmadas (solo agentes humanos). */
  async obtenerDisponibilidad(
    agenteId: string,
    clienteId: string,
    fecha: string,
    duracionMinutos: number,
  ): Promise<string[]> {
    const agente = await this.agenteService.obtener(agenteId, clienteId)
    const slots = await this.horarioAgenteService.generarSlotsBase(agenteId, clienteId, fecha, duracionMinutos)

    if (agente.tipoAgente !== TipoAgente.HUMANO) return slots

    const inicioDia = new Date(`${fecha}T00:00:00`)
    const finDia = new Date(`${fecha}T23:59:59`)
    const reservasAgente = await this.reservaRepository.find({
      where: { agenteId, clienteId, estado: Status.ACTIVE, estadoReserva: Not(EstadoReserva.CANCELADA) },
    })
    const delDia = reservasAgente.filter(r => r.fechaInicio >= inicioDia && r.fechaInicio <= finDia)

    return slots.filter(hhmm => {
      const inicio = this.aFechaLocal(fecha, hhmm)
      const fin = new Date(inicio.getTime() + duracionMinutos * 60000)
      return !delDia.some(r => this.seSolapan(inicio, fin, r.fechaInicio, r.fechaFin))
    })
  }

  /** Quita tildes/diacríticos para comparar nombres sin importar cómo los tipeó el cliente ("María" == "Maria"). */
  private normalizarNombre(texto: string): string {
    return texto.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  }

  /** Busca por NOMBRE en el equipo humano activo (nunca por ID — el cliente final no conoce IDs internos). */
  async buscarHumanoPorNombre(clienteId: string, nombreSolicitado: string): Promise<{ agente: Agente | null; error?: string }> {
    const humanos = await this.agenteService.listarHumanosActivos(clienteId)
    const termino = this.normalizarNombre(nombreSolicitado)
    const coincidencias = humanos.filter(a => this.normalizarNombre(a.nombre).includes(termino))

    if (coincidencias.length === 0) {
      const nombres = humanos.map(a => a.nombre).join(', ') || 'no hay nadie registrado en el equipo humano'
      return { agente: null, error: `No encontré a nadie llamado "${nombreSolicitado}" en el equipo. Las personas disponibles son: ${nombres}. Pregúntale al cliente con cuál de ellas prefiere, usando el nombre (nunca pidas un ID).` }
    }
    if (coincidencias.length > 1) {
      const nombres = coincidencias.map(a => a.nombre).join(', ')
      return { agente: null, error: `Hay varias personas que coinciden con "${nombreSolicitado}": ${nombres}. Pídele al cliente que precise el nombre completo.` }
    }
    return { agente: coincidencias[0] }
  }

  /**
   * Sin nombre especificado: si hay 0 humanos, deja que el llamador decida el fallback
   * (IA); si hay 1, lo usa directo; si hay varios, elige el primero libre en ese horario
   * exacto para no forzar al cliente a elegir entre nombres que ni conoce.
   */
  async elegirHumanoDisponible(clienteId: string, fechaInicio: Date, fechaFin: Date): Promise<{ agente: Agente | null; error?: string }> {
    const humanos = await this.agenteService.listarHumanosActivos(clienteId)

    if (humanos.length === 0) return { agente: null }
    if (humanos.length === 1) return { agente: humanos[0] }

    for (const candidato of humanos) {
      const libre = await this.estaLibreEnHorario(candidato.id, clienteId, fechaInicio, fechaFin)
      if (libre) return { agente: candidato }
    }
    const nombres = humanos.map(a => a.nombre).join(', ')
    return { agente: null, error: `Nadie del equipo (${nombres}) tiene ese horario libre. Ofrécele al cliente otra fecha/hora.` }
  }

  private async estaLibreEnHorario(agenteId: string, clienteId: string, fechaInicio: Date, fechaFin: Date): Promise<boolean> {
    try {
      await this.validarDentroDeHorario(agenteId, clienteId, fechaInicio, fechaFin)
      await this.validarSinSolapamiento(agenteId, clienteId, fechaInicio, fechaFin)
      return true
    } catch {
      return false
    }
  }

  /** Unión de horarios libres de TODO el equipo humano activo — para "¿qué horarios tienen?" sin especificar a quién. */
  async obtenerDisponibilidadEquipo(clienteId: string, fecha: string, duracionMinutos: number): Promise<string[]> {
    const humanos = await this.agenteService.listarHumanosActivos(clienteId)
    const slots = new Set<string>()
    for (const humano of humanos) {
      const libres = await this.obtenerDisponibilidad(humano.id, clienteId, fecha, duracionMinutos)
      libres.forEach(s => slots.add(s))
    }
    return Array.from(slots).sort()
  }

  /** Construye un Date en hora LOCAL a partir de "YYYY-MM-DD" + "HH:mm" (evita el desfase de `new Date("YYYY-MM-DD")`, que se interpreta en UTC). */
  private aFechaLocal(fecha: string, horaHHmm: string): Date {
    const [anio, mes, dia] = fecha.split('-').map(Number)
    const [h, m] = horaHHmm.split(':').map(Number)
    return new Date(anio, mes - 1, dia, h, m, 0, 0)
  }

  /** Formatea un Date a "YYYY-MM-DD" y "HH:mm" en hora LOCAL (nunca toISOString, que convierte a UTC y puede correr la fecha). */
  private aFechaYHoraLocal(fecha: Date): { fecha: string; hora: string } {
    const pad = (n: number) => String(n).padStart(2, '0')
    return {
      fecha: `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`,
      hora: `${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`,
    }
  }

  private async validarDentroDeHorario(agenteId: string, clienteId: string, fechaInicio: Date, fechaFin: Date): Promise<void> {
    const { fecha, hora: horaInicioStr } = this.aFechaYHoraLocal(fechaInicio)
    const duracion = Math.round((fechaFin.getTime() - fechaInicio.getTime()) / 60000)

    const slots = await this.horarioAgenteService.generarSlotsBase(agenteId, clienteId, fecha, duracion)
    if (!slots.includes(horaInicioStr)) {
      throw new BadRequestException(
        `El agente no tiene horario de atención disponible el ${fecha} a las ${horaInicioStr} por ${duracion} minutos.`,
      )
    }
  }

  private async validarSinSolapamiento(
    agenteId: string,
    clienteId: string,
    fechaInicio: Date,
    fechaFin: Date,
    excluirReservaId?: string,
  ): Promise<void> {
    const candidatas = await this.reservaRepository.find({
      where: { agenteId, clienteId, estado: Status.ACTIVE, estadoReserva: Not(EstadoReserva.CANCELADA) },
    })

    const solapa = candidatas.some(r => {
      if (excluirReservaId && r.id === excluirReservaId) return false
      return this.seSolapan(fechaInicio, fechaFin, r.fechaInicio, r.fechaFin)
    })

    if (solapa) {
      throw new ConflictException('El agente ya tiene una reserva confirmada que se solapa con ese horario.')
    }
  }

  private seSolapan(inicio1: Date, fin1: Date, inicio2: Date, fin2: Date): boolean {
    return inicio1 < fin2 && inicio2 < fin1
  }

  private async generarCodigoReserva(clienteId: string): Promise<string> {
    const yyyymmdd = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const prefijo = `RES-${yyyymmdd}-`
    const conteo = await this.reservaRepository
      .createQueryBuilder('r')
      .where('r.cliente_id = :clienteId', { clienteId })
      .andWhere('r.codigo_reserva LIKE :prefijo', { prefijo: `${prefijo}%` })
      .getCount()
    const consecutivo = String(conteo + 1).padStart(4, '0')
    return `${prefijo}${consecutivo}`
  }
}
