import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Conversacion } from '../entity/conversacion.entity'
import { CreateConversacionDto, AgregarMensajeDto } from '../dto/create-conversacion.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'
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
      order: { fechaCreacion: 'DESC' },
      take: 100,
    })
  }

  async obtener(id: string): Promise<Conversacion> {
    const conv = await this.conversacionRepository.findOne({ where: { id, estado: Status.ACTIVE } })
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
    }
    conv.mensajes = [...(conv.mensajes || []), nuevoMensaje]
    conv.totalMensajes = conv.mensajes.length
    conv.transaccion = Transacccion.ACTUALIZAR
    return this.conversacionRepository.save(conv)
  }

  async actualizarScore(id: string, score: number): Promise<void> {
    await this.conversacionRepository.update(id, { score })
  }

  async actualizarEstado(id: string, estadoConversacion: string): Promise<void> {
    await this.conversacionRepository.update(id, { estadoConversacion })
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
