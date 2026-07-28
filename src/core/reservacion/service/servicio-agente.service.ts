import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ServicioAgente } from '../entity/servicio-agente.entity'
import { CreateServicioAgenteDto, UpdateServicioAgenteDto } from '../dto/servicio-agente.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'

@Injectable()
export class ServicioAgenteService extends BaseService {
  constructor(
    @InjectRepository(ServicioAgente)
    private readonly servicioAgenteRepository: Repository<ServicioAgente>,
  ) {
    super(ServicioAgenteService.name)
  }

  async listarPorAgente(agenteId: string, clienteId: string): Promise<ServicioAgente[]> {
    return this.servicioAgenteRepository.find({
      where: { agenteId, clienteId, estado: Status.ACTIVE },
      order: { fechaCreacion: 'ASC' },
    })
  }

  async obtener(id: string, clienteId: string): Promise<ServicioAgente> {
    const servicio = await this.servicioAgenteRepository.findOne({
      where: { id, clienteId, estado: Status.ACTIVE },
    })
    if (!servicio) throw new NotFoundException('Servicio no encontrado')
    return servicio
  }

  async crear(dto: CreateServicioAgenteDto, usuarioCreacion: string, clienteId: string): Promise<ServicioAgente> {
    const servicio = this.servicioAgenteRepository.create({
      ...dto,
      clienteId,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.servicioAgenteRepository.save(servicio)
  }

  async actualizar(
    id: string,
    dto: UpdateServicioAgenteDto,
    usuarioModificacion: string,
    clienteId: string,
  ): Promise<ServicioAgente> {
    const servicio = await this.obtener(id, clienteId)
    Object.assign(servicio, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.servicioAgenteRepository.save(servicio)
  }

  async eliminar(id: string, usuarioModificacion: string, clienteId: string): Promise<void> {
    const servicio = await this.obtener(id, clienteId)
    servicio.estado = Status.ELIMINATE
    servicio.transaccion = Transacccion.ELIMINAR
    servicio.usuarioModificacion = usuarioModificacion
    await this.servicioAgenteRepository.save(servicio)
  }
}
