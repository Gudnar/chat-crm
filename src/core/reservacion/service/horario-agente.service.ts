import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { HorarioAgente } from '../entity/horario-agente.entity'
import { CreateHorarioAgenteDto } from '../dto/horario-agente.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'

@Injectable()
export class HorarioAgenteService extends BaseService {
  constructor(
    @InjectRepository(HorarioAgente)
    private readonly horarioAgenteRepository: Repository<HorarioAgente>,
  ) {
    super(HorarioAgenteService.name)
  }

  async listarPorAgente(agenteId: string, clienteId: string): Promise<HorarioAgente[]> {
    return this.horarioAgenteRepository.find({
      where: { agenteId, clienteId, estado: Status.ACTIVE },
      order: { diaSemana: 'ASC', horaInicio: 'ASC' },
    })
  }

  async crear(dto: CreateHorarioAgenteDto, usuarioCreacion: string, clienteId: string): Promise<HorarioAgente> {
    if (dto.horaFin <= dto.horaInicio) {
      throw new NotFoundException('horaFin debe ser posterior a horaInicio')
    }
    const horario = this.horarioAgenteRepository.create({
      ...dto,
      clienteId,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.horarioAgenteRepository.save(horario)
  }

  async eliminar(id: string, usuarioModificacion: string, clienteId: string): Promise<void> {
    const horario = await this.horarioAgenteRepository.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!horario) throw new NotFoundException('Horario no encontrado')
    horario.estado = Status.ELIMINATE
    horario.transaccion = Transacccion.ELIMINAR
    horario.usuarioModificacion = usuarioModificacion
    await this.horarioAgenteRepository.save(horario)
  }

  /**
   * Genera los horarios de inicio posibles ("HH:mm") para una fecha dada, a partir de
   * las franjas configuradas para ese día de semana. NO descuenta reservas ya tomadas
   * — eso lo hace ReservacionService, que es quien conoce la entidad Reserva (evita
   * dependencia circular entre servicios).
   */
  async generarSlotsBase(agenteId: string, clienteId: string, fecha: string, duracionMinutos: number): Promise<string[]> {
    const diaSemana = new Date(`${fecha}T00:00:00`).getDay()

    const horarios = await this.horarioAgenteRepository.find({
      where: { agenteId, clienteId, diaSemana, activo: true, estado: Status.ACTIVE },
      order: { horaInicio: 'ASC' },
    })

    const slots: string[] = []
    for (const horario of horarios) {
      const inicioMin = this.aMinutos(horario.horaInicio)
      const finMin = this.aMinutos(horario.horaFin)
      for (let m = inicioMin; m + duracionMinutos <= finMin; m += duracionMinutos) {
        slots.push(this.aHHmm(m))
      }
    }
    return slots
  }

  private aMinutos(hhmm: string): number {
    const [h, m] = hhmm.split(':').map(Number)
    return h * 60 + m
  }

  private aHHmm(minutos: number): string {
    const h = Math.floor(minutos / 60)
    const m = minutos % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
}
