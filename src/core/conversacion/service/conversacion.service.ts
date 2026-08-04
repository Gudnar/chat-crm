import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { Conversacion } from '../entity/conversacion.entity'
import { CreateConversacionDto, AgregarMensajeDto } from '../dto/create-conversacion.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion, TipoAgente } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'

@Injectable()
export class ConversacionService extends BaseService {
  constructor(
    @InjectRepository(Conversacion)
    private readonly conversacionRepository: Repository<Conversacion>
  ) {
    super(ConversacionService.name)
  }

  async listar(clienteId: string | null, agenteId?: string): Promise<Conversacion[]> {
    const where: any = { estado: Status.ACTIVE }
    if (clienteId) where.clienteId = clienteId
    if (agenteId) where.agenteId = agenteId
    return this.conversacionRepository.find({
      where,
      order: { fechaModificacion: 'DESC' },
      take: 100,
    })
  }

  async obtener(id: string): Promise<Conversacion> {
    const conv = await this.conversacionRepository.findOne({ where: { id, estado: Status.ACTIVE } })
    if (!conv) throw new NotFoundException(Messages.CONVERSACION_NOT_FOUND)
    return conv
  }

  async obtenerPorClienteId(id: string, clienteId: string): Promise<Conversacion> {
    const conv = await this.conversacionRepository.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!conv) throw new NotFoundException(Messages.CONVERSACION_NOT_FOUND)
    return conv
  }

  async crear(dto: CreateConversacionDto, usuarioCreacion: string, clienteId: string): Promise<Conversacion> {
    const conv = this.conversacionRepository.create({
      ...dto,
      clienteId,
      canal: dto.canal || 'chat',
      estadoConversacion: 'abierto',
      mensajes: [],
      etiquetas: dto.etiquetas ?? [],
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.conversacionRepository.save(conv)
  }

  async agregarMensaje(id: string, dto: AgregarMensajeDto): Promise<Conversacion> {
    const conv = await this.obtener(id)
    const nuevoMensaje = {
      role: dto.role,
      content: dto.content,
      timestamp: new Date().toISOString(),
      ...(dto.adjunto ? { adjunto: dto.adjunto } : {}),
      ...(dto.interactivo ? { interactivo: dto.interactivo } : {}),
      ...(dto.enlace ? { enlace: dto.enlace } : {}),
      ...(dto.pidioUbicacion ? { pidioUbicacion: true } : {}),
      ...(dto.ubicacion ? { ubicacion: dto.ubicacion } : {}),
    }
    conv.mensajes = [...(conv.mensajes || []), nuevoMensaje]
    conv.totalMensajes = conv.mensajes.length
    conv.transaccion = Transacccion.ACTUALIZAR
    return this.conversacionRepository.save(conv)
  }

  /** Marca la conversación como atendida directamente por un agente humano (canal staffeado por una persona, sin IA de por medio). */
  async asignarAgenteHumano(id: string, agenteHumanoId: string): Promise<void> {
    const conv = await this.obtener(id)
    conv.agenteHumanoId = agenteHumanoId
    conv.tipoAgenteAsignado = TipoAgente.HUMANO
    conv.fechaAsignacionHumano = new Date()
    conv.transaccion = Transacccion.ACTUALIZAR
    await this.conversacionRepository.save(conv)
  }

  /**
   * Conversaciones "pendiente" de un agente cuyo último mensaje es del cliente, tiene
   * al menos `horasMinimas` de antigüedad, nunca recibió un recordatorio, y en ningún
   * mensaje hay foto ni ubicación — o sea, siguen esperando la captura. El filtrado se
   * hace en JS (no en SQL/JSONB) a propósito: son pocas filas por agente y es mucho
   * más simple de mantener que una consulta JSONB compleja.
   */
  async listarPendientesParaRecordatorio(agenteId: string, horasMinimas: number): Promise<Conversacion[]> {
    const candidatas = await this.conversacionRepository.find({
      where: { agenteId, estadoConversacion: 'pendiente', estado: Status.ACTIVE, ultimoRecordatorioEn: IsNull() },
    })

    const limite = Date.now() - horasMinimas * 60 * 60 * 1000
    return candidatas.filter(conv => {
      const mensajes = conv.mensajes || []
      if (!mensajes.length) return false
      const ultimo = mensajes[mensajes.length - 1]
      if (ultimo.role !== 'user') return false
      if (new Date(ultimo.timestamp).getTime() > limite) return false
      const yaTieneCaptura = mensajes.some(m => m.adjunto?.tipo === 'image' || m.ubicacion)
      return !yaTieneCaptura
    })
  }

  async marcarRecordatorioEnviado(id: string): Promise<void> {
    await this.conversacionRepository.update(id, { ultimoRecordatorioEn: new Date() })
  }

  async yaSeEnvioRecurso(id: string, recursoId: string): Promise<boolean> {
    const conv = await this.obtener(id)
    return (conv.recursosEnviados || []).includes(recursoId)
  }

  async marcarRecursoEnviado(id: string, recursoId: string): Promise<void> {
    const conv = await this.obtener(id)
    if ((conv.recursosEnviados || []).includes(recursoId)) return
    conv.recursosEnviados = [...(conv.recursosEnviados || []), recursoId]
    conv.transaccion = Transacccion.ACTUALIZAR
    await this.conversacionRepository.save(conv)
  }

  async actualizarScore(id: string, score: number): Promise<void> {
    await this.conversacionRepository.update(id, { score })
  }

  async actualizarEstado(id: string, estadoConversacion: string): Promise<void> {
    await this.conversacionRepository.update(id, { estadoConversacion })
  }

  async eliminar(id: string, clienteId: string, usuarioModificacion: string): Promise<void> {
    const conv = await this.obtenerPorClienteId(id, clienteId)
    conv.estado = Status.ELIMINATE
    conv.transaccion = Transacccion.ELIMINAR
    conv.usuarioModificacion = usuarioModificacion
    await this.conversacionRepository.save(conv)
  }

  async escalar(id: string, razon?: string): Promise<void> {
    const conv = await this.obtener(id)
    conv.escalado = true
    conv.estadoConversacion = 'pendiente'
    if (razon) {
      conv.notas = conv.notas ? `${conv.notas}\n[ESCALADO] ${razon}` : `[ESCALADO] ${razon}`
    }
    conv.transaccion = Transacccion.ACTUALIZAR
    await this.conversacionRepository.save(conv)
  }

  async agregarNota(id: string, nota: string): Promise<void> {
    const conv = await this.obtener(id)
    const ts = new Date().toISOString()
    conv.notas = conv.notas ? `${conv.notas}\n[${ts}] ${nota}` : `[${ts}] ${nota}`
    conv.transaccion = Transacccion.ACTUALIZAR
    await this.conversacionRepository.save(conv)
  }

  async actualizarNotas(id: string, notas: string): Promise<Conversacion> {
    const conv = await this.obtener(id)
    conv.notas = notas
    conv.transaccion = Transacccion.ACTUALIZAR
    return this.conversacionRepository.save(conv)
  }

  async actualizarAgente(id: string, agenteId: string | null): Promise<Conversacion> {
    const conv = await this.obtener(id)
    if (agenteId) {
      conv.agenteId = String(parseInt(agenteId, 10))
    } else {
      conv.agenteId = null
    }
    conv.transaccion = Transacccion.ACTUALIZAR
    return this.conversacionRepository.save(conv)
  }

  async actualizarEtiquetas(id: string, etiquetas: string[]): Promise<Conversacion> {
    const conv = await this.obtener(id)
    conv.etiquetas = Array.isArray(etiquetas) ? etiquetas : []
    conv.transaccion = Transacccion.ACTUALIZAR
    return this.conversacionRepository.save(conv)
  }

  async estadisticas(clienteId: string | null, agenteId?: string): Promise<any> {
    const where: any = { estado: Status.ACTIVE }
    if (clienteId) where.clienteId = clienteId
    if (agenteId) where.agenteId = agenteId

    const qb = this.conversacionRepository.createQueryBuilder('c')
      .where('c.estado = :estado', { estado: Status.ACTIVE })
    if (clienteId) qb.andWhere('c.cliente_id = :clienteId', { clienteId })
    if (agenteId) qb.andWhere('c.agente_id = :agenteId', { agenteId })

    const [total, escaladas, resueltas, abiertas] = await Promise.all([
      this.conversacionRepository.count({ where }),
      this.conversacionRepository.count({ where: { ...where, escalado: true } }),
      this.conversacionRepository.count({ where: { ...where, estadoConversacion: 'resuelto' } }),
      this.conversacionRepository.count({ where: { ...where, estadoConversacion: 'abierto' } }),
    ])

    const msgResult = await qb.clone()
      .select('COALESCE(SUM(c.total_mensajes), 0)', 'sum')
      .getRawOne()
    const totalMensajes = parseInt(msgResult?.sum || '0', 10)

    const hotLeads = await qb.clone()
      .andWhere('c.score >= 70').getCount()
    const warmLeads = await qb.clone()
      .andWhere('c.score >= 40').andWhere('c.score < 70').getCount()
    const coldLeads = await qb.clone()
      .andWhere('c.score < 40').getCount()

    const canalRows: Array<{ canal: string; cnt: string }> = await qb.clone()
      .select('c.canal', 'canal')
      .addSelect('COUNT(*)', 'cnt')
      .groupBy('c.canal')
      .getRawMany()

    const porCanal: Record<string, number> = {}
    for (const row of canalRows) porCanal[row.canal] = parseInt(row.cnt, 10)

    return {
      total,
      escaladas,
      resueltas,
      abiertas,
      totalMensajes,
      hotLeads,
      warmLeads,
      coldLeads,
      porCanal,
      porcentajeResolucion: total > 0 ? Math.round((resueltas / total) * 100) : 0,
    }
  }
}
