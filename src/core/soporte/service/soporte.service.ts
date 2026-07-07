import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { CasoSoporte } from '../entity/caso.entity'
import { Conversacion } from '../../conversacion/entity/conversacion.entity'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'

@Injectable()
export class SoporteService extends BaseService {
  constructor(
    @InjectRepository(CasoSoporte)
    private readonly casoRepository: Repository<CasoSoporte>,
    @InjectRepository(Conversacion)
    private readonly conversacionRepo: Repository<Conversacion>,
  ) {
    super(SoporteService.name)
  }

  /** Correlativo por cliente, mismo formato que Oportunidades (CASO-0001-2) */
  private async generarNumeroCaso(clienteId: string): Promise<string> {
    const ultimo = await this.casoRepository.createQueryBuilder('c')
      .select('MAX(c.id)', 'max')
      .where('c.clienteId = :clienteId', { clienteId })
      .getRawOne()
    const siguiente = (parseInt(ultimo?.max, 10) || 0) + 1
    return `CASO-${String(siguiente).padStart(4, '0')}-${clienteId}`
  }

  /**
   * Sincroniza el nombre configurado del contacto (notas "Nombre: X" en la Bandeja)
   * y el teléfono desde la conversación vinculada — igual que en Oportunidades.
   */
  private async sincronizarDesdeConversacion(casos: CasoSoporte[]): Promise<void> {
    const conConversacion = casos.filter(c => c.conversacionId)
    if (!conConversacion.length) return

    const ids = [...new Set(conConversacion.map(c => String(c.conversacionId)))]
    const convs = await this.conversacionRepo.find({ where: { id: In(ids) } })
    const porId = new Map(convs.map(c => [String(c.id), c]))

    for (const caso of conConversacion) {
      const conv = porId.get(String(caso.conversacionId))
      if (!conv) continue

      const updates: Partial<CasoSoporte> = {}
      const nombreAsignado = conv.notas && conv.notas.startsWith('Nombre:')
        ? conv.notas.replace('Nombre:', '').trim()
        : null
      if (nombreAsignado && caso.nombreContacto !== nombreAsignado) {
        updates.nombreContacto = nombreAsignado
      }
      if (!caso.telefonoContacto) updates.telefonoContacto = conv.contacto

      if (Object.keys(updates).length) {
        Object.assign(caso, updates)
        await this.casoRepository.update(caso.id, updates)
      }
    }
  }

  async listar(clienteId: string): Promise<CasoSoporte[]> {
    const casos = await this.casoRepository.find({
      where: { clienteId, estado: Status.ACTIVE },
      order: { fechaCreacion: 'DESC' },
      take: 100,
    })
    await this.sincronizarDesdeConversacion(casos)
    return casos
  }

  async obtener(id: string, clienteId: string): Promise<CasoSoporte> {
    const caso = await this.casoRepository.findOne({
      where: { id, clienteId, estado: Status.ACTIVE }
    })
    if (!caso) throw new NotFoundException('Caso no encontrado')
    await this.sincronizarDesdeConversacion([caso])
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
    conversacionId?: string,
    telefonoContacto?: string,
    emailContacto?: string,
  ): Promise<CasoSoporte> {
    // Si viene de una conversación (botón en la Bandeja), completar datos como en Oportunidades
    if (conversacionId) {
      const conv = await this.conversacionRepo.findOne({
        where: { id: conversacionId, clienteId, estado: Status.ACTIVE },
      })
      if (conv) {
        const nombreAsignado = conv.notas && conv.notas.startsWith('Nombre:')
          ? conv.notas.replace('Nombre:', '').trim()
          : null
        nombreContacto = nombreContacto || nombreAsignado || conv.contacto
        telefonoContacto = telefonoContacto || conv.contacto
        const ultimoDelCliente = [...(conv.mensajes || [])].reverse().find(m => m.role === 'user')
        titulo = titulo || `Atención a ${nombreContacto} (${conv.canal})`
        descripcion = descripcion || (ultimoDelCliente
          ? `Último mensaje del cliente: "${ultimoDelCliente.content}"`
          : `Caso creado desde la conversación de ${conv.canal}`)
        categoria = categoria || conv.canal
      }
    }

    const numeroCaso = await this.generarNumeroCaso(clienteId)

    const caso = this.casoRepository.create({
      numeroCaso,
      titulo,
      descripcion,
      nombreContacto,
      telefonoContacto: telefonoContacto || undefined,
      emailContacto: emailContacto || undefined,
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
        detalles: conversacionId
          ? `Caso ${numeroCaso} creado desde la conversación #${conversacionId}`
          : `Caso ${numeroCaso} creado`,
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
