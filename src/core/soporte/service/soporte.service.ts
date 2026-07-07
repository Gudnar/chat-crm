import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CasoSoporte } from '../entity/caso.entity'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'

@Injectable()
export class SoporteService extends BaseService {
  constructor(
    @InjectRepository(CasoSoporte)
    private readonly casoRepository: Repository<CasoSoporte>
  ) {
    super(SoporteService.name)
  }

  async listar(clienteId: string): Promise<CasoSoporte[]> {
    return this.casoRepository.find({
      where: { clienteId, estado: Status.ACTIVE },
      order: { fechaCreacion: 'DESC' },
      take: 100,
    })
  }

  async obtener(id: string, clienteId: string): Promise<CasoSoporte> {
    const caso = await this.casoRepository.findOne({
      where: { id, clienteId, estado: Status.ACTIVE }
    })
    if (!caso) throw new NotFoundException('Caso no encontrado')
    return caso
  }

  async crear(
    titulo: string,
    descripcion: string,
    nombreContacto: string,
    prioridad: string,
    categoria: string,
    clienteId: string,
    usuarioCreacion: string,
    conversacionId?: string
  ): Promise<CasoSoporte> {
    const numeroCaso = `CASO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const caso = this.casoRepository.create({
      numeroCaso,
      titulo,
      descripcion,
      nombreContacto,
      prioridad,
      categoria,
      conversacionId,
      clienteId,
      estadoCaso: 'abierto',
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
      historial: [{
        timestamp: new Date().toISOString(),
        accion: 'Caso creado',
        usuario: usuarioCreacion,
        detalles: `Caso ${numeroCaso} creado`,
      }],
    })
    return this.casoRepository.save(caso)
  }

  async actualizar(id: string, clienteId: string, updates: any): Promise<CasoSoporte> {
    const caso = await this.obtener(id, clienteId)

    if ('estadoCaso' in updates || 'prioridad' in updates || 'asignadoA' in updates) {
      const historialEntry = {
        timestamp: new Date().toISOString(),
        accion: 'Caso actualizado',
        usuario: updates.usuarioModificacion || 'sistema',
        detalles: Object.keys(updates)
          .filter(k => k !== 'usuarioModificacion')
          .map(k => `${k}: ${updates[k]}`)
          .join(', '),
      }
      caso.historial = [...(caso.historial || []), historialEntry]
    }

    Object.assign(caso, updates)
    caso.transaccion = Transacccion.ACTUALIZAR

    if (updates.estadoCaso === 'resuelto' && !caso.fechaResolucion) {
      caso.fechaResolucion = new Date()
    }

    return this.casoRepository.save(caso)
  }

  async cambiarEstado(id: string, clienteId: string, nuevoEstado: string, usuarioId: string): Promise<CasoSoporte> {
    return this.actualizar(id, clienteId, {
      estadoCaso: nuevoEstado,
      usuarioModificacion: usuarioId,
    })
  }

  async agregarNota(id: string, clienteId: string, nota: string, usuarioId: string): Promise<CasoSoporte> {
    const caso = await this.obtener(id, clienteId)
    const entrada = {
      timestamp: new Date().toISOString(),
      accion: 'Nota agregada',
      usuario: usuarioId,
      detalles: nota,
    }
    caso.historial = [...(caso.historial || []), entrada]
    caso.transaccion = Transacccion.ACTUALIZAR
    return this.casoRepository.save(caso)
  }

  async estadisticas(clienteId: string): Promise<any> {
    const where = { clienteId, estado: Status.ACTIVE }
    const total = await this.casoRepository.count({ where })
    const abiertos = await this.casoRepository.count({ where: { ...where, estadoCaso: 'abierto' } })
    const enProgreso = await this.casoRepository.count({ where: { ...where, estadoCaso: 'en_progreso' } })
    const resueltos = await this.casoRepository.count({ where: { ...where, estadoCaso: 'resuelto' } })
    const cerrados = await this.casoRepository.count({ where: { ...where, estadoCaso: 'cerrado' } })

    const porPrioridad = await this.casoRepository.createQueryBuilder('c')
      .where('c.cliente_id = :clienteId', { clienteId })
      .andWhere('c._estado = :estado', { estado: Status.ACTIVE })
      .select('c.prioridad', 'prioridad')
      .addSelect('COUNT(*)', 'count')
      .groupBy('c.prioridad')
      .getRawMany()

    return {
      total,
      abiertos,
      enProgreso,
      resueltos,
      cerrados,
      porPrioridad: porPrioridad.reduce((acc, p) => {
        acc[p.prioridad] = parseInt(p.count, 10)
        return acc
      }, {} as Record<string, number>),
    }
  }
}
