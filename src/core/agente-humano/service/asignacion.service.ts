import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { Conversacion } from '../../conversacion/entity/conversacion.entity'
import { Agente } from '../../agente/entity/agente.entity'
import { AsignacionAgenteHumano } from '../entity/asignacion-agente-humano.entity'
import { AsignarConversacionDto, CerrarConversacionDto } from '../dto/agente-humano.dto'
import { AgenteHumanoService } from './agente-humano.service'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion, TipoAgente, DisponibilidadAgente, TipoActividadAgente, EstadoConversacion } from '../../../common/constants'

@Injectable()
export class AsignacionService extends BaseService {
  constructor(
    @InjectRepository(Conversacion)
    private readonly conversacionRepository: Repository<Conversacion>,
    @InjectRepository(Agente)
    private readonly agenteRepository: Repository<Agente>,
    @InjectRepository(AsignacionAgenteHumano)
    private readonly asignacionRepository: Repository<AsignacionAgenteHumano>,
    private readonly agenteHumanoService: AgenteHumanoService,
  ) {
    super(AsignacionService.name)
  }

  // ── Asignación manual / escalada ──────────────────────────────────────────

  async asignar(dto: AsignarConversacionDto, asignadoPor: string, clienteId: string) {
    const conversacion = await this.conversacionRepository.findOne({
      where: { id: dto.conversacionId, clienteId, estado: Status.ACTIVE },
    })
    if (!conversacion) throw new NotFoundException('La conversación no fue encontrada.')

    const agente = await this.agenteRepository.findOne({
      where: { id: dto.agenteHumanoId, clienteId, tipoAgente: TipoAgente.HUMANO, activo: true, estado: Status.ACTIVE },
    })
    if (!agente) throw new NotFoundException('El agente humano no fue encontrado o está inactivo.')

    // Si la conversación ya tenía un agente humano, marcar la asignación previa como reasignada
    if (conversacion.agenteHumanoId && conversacion.agenteHumanoId !== dto.agenteHumanoId) {
      await this.asignacionRepository.update(
        { conversacionId: conversacion.id, estadoAsignacion: 'activa' },
        { estadoAsignacion: 'reasignada', fechaCierre: new Date(), transaccion: Transacccion.ACTUALIZAR },
      )
    }

    // Registrar la nueva asignación
    const asignacion = this.asignacionRepository.create({
      conversacionId: conversacion.id,
      agenteHumanoId: agente.id,
      asignadoPor,
      razonAsignacion: dto.razon,
      fueEscalada: dto.esEscalada ?? false,
      estadoAsignacion: 'activa',
      clienteId,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion: asignadoPor,
    })
    await this.asignacionRepository.save(asignacion)

    // Actualizar la conversación
    conversacion.agenteHumanoId = agente.id
    conversacion.tipoAgenteAsignado = TipoAgente.HUMANO
    conversacion.fechaAsignacionHumano = new Date()
    if (dto.esEscalada) conversacion.escalado = true
    if (conversacion.estadoConversacion === EstadoConversacion.RESUELTO) {
      conversacion.estadoConversacion = EstadoConversacion.ABIERTO
    }
    conversacion.transaccion = Transacccion.ACTUALIZAR
    await this.conversacionRepository.save(conversacion)

    await this.agenteHumanoService.registrarActividad(
      agente.id,
      clienteId,
      dto.esEscalada ? TipoActividadAgente.ESCALADA : TipoActividadAgente.ASIGNACION,
      { razon: dto.razon, asignadoPor },
      conversacion.id,
    )

    this.logger.log(`Conversación ${conversacion.id} asignada al agente humano ${agente.nombre}`)
    return { conversacionId: conversacion.id, agenteHumanoId: agente.id, agenteNombre: agente.nombre }
  }

  // ── Panel del agente ──────────────────────────────────────────────────────

  async misConversaciones(agenteHumanoId: string, clienteId: string) {
    return this.conversacionRepository.find({
      where: { agenteHumanoId, clienteId, estado: Status.ACTIVE },
      order: { fechaCreacion: 'DESC' },
      take: 100,
    })
  }

  async cerrar(conversacionId: string, dto: CerrarConversacionDto, actor: { agenteHumanoId?: string; usuarioId: string }, clienteId: string) {
    const conversacion = await this.conversacionRepository.findOne({
      where: { id: conversacionId, clienteId, estado: Status.ACTIVE },
    })
    if (!conversacion) throw new NotFoundException('La conversación no fue encontrada.')

    // Un agente humano solo puede cerrar sus propias conversaciones
    if (actor.agenteHumanoId && conversacion.agenteHumanoId !== actor.agenteHumanoId) {
      throw new ForbiddenException('Solo puedes cerrar conversaciones asignadas a ti.')
    }

    conversacion.estadoConversacion = EstadoConversacion.RESUELTO
    if (dto.resolucion) conversacion.resolucion = dto.resolucion
    conversacion.transaccion = Transacccion.ACTUALIZAR
    await this.conversacionRepository.save(conversacion)

    // Cerrar la asignación activa y calcular el tiempo de atención
    const asignacion = await this.asignacionRepository.findOne({
      where: { conversacionId, estadoAsignacion: 'activa', estado: Status.ACTIVE },
      order: { fechaAsignacion: 'DESC' },
    })
    if (asignacion) {
      const ahora = new Date()
      asignacion.estadoAsignacion = 'cerrada'
      asignacion.fechaCierre = ahora
      asignacion.tiempoAtencionSegundos = Math.round(
        (ahora.getTime() - new Date(asignacion.fechaAsignacion).getTime()) / 1000,
      )
      asignacion.transaccion = Transacccion.ACTUALIZAR
      await this.asignacionRepository.save(asignacion)

      await this.agenteHumanoService.registrarActividad(
        asignacion.agenteHumanoId,
        clienteId,
        TipoActividadAgente.CIERRE,
        { resolucion: dto.resolucion, tiempoSegundos: asignacion.tiempoAtencionSegundos },
        conversacionId,
      )
    }

    return { conversacionId, estadoConversacion: EstadoConversacion.RESUELTO }
  }

  /** Devuelve la conversación al agente IA (libera al humano). */
  async devolverAIa(conversacionId: string, actor: { agenteHumanoId?: string; usuarioId: string }, clienteId: string) {
    const conversacion = await this.conversacionRepository.findOne({
      where: { id: conversacionId, clienteId, estado: Status.ACTIVE },
    })
    if (!conversacion) throw new NotFoundException('La conversación no fue encontrada.')

    if (actor.agenteHumanoId && conversacion.agenteHumanoId !== actor.agenteHumanoId) {
      throw new ForbiddenException('Solo puedes liberar conversaciones asignadas a ti.')
    }

    const agenteHumanoAnterior = conversacion.agenteHumanoId

    await this.asignacionRepository.update(
      { conversacionId, estadoAsignacion: 'activa' },
      { estadoAsignacion: 'cerrada', fechaCierre: new Date(), transaccion: Transacccion.ACTUALIZAR },
    )

    conversacion.agenteHumanoId = null
    conversacion.tipoAgenteAsignado = TipoAgente.IA
    conversacion.escalado = false
    conversacion.transaccion = Transacccion.ACTUALIZAR
    await this.conversacionRepository.save(conversacion)

    if (agenteHumanoAnterior) {
      await this.agenteHumanoService.registrarActividad(
        agenteHumanoAnterior,
        clienteId,
        TipoActividadAgente.REASIGNACION,
        { accion: 'devuelta_a_ia' },
        conversacionId,
      )
    }

    return { conversacionId, tipoAgenteAsignado: TipoAgente.IA }
  }

  // ── Cola y asignación automática ──────────────────────────────────────────

  /** Conversaciones escaladas o abiertas que aún no tienen agente humano. */
  async colaSinAsignar(clienteId: string) {
    return this.conversacionRepository.find({
      where: [
        { clienteId, estado: Status.ACTIVE, escalado: true, agenteHumanoId: IsNull() },
        { clienteId, estado: Status.ACTIVE, agenteId: IsNull(), agenteHumanoId: IsNull(), estadoConversacion: EstadoConversacion.ABIERTO },
      ],
      order: { fechaCreacion: 'ASC' },
      take: 50,
    })
  }

  /**
   * Asignación automática: reparte la cola entre agentes disponibles,
   * priorizando a los que tienen menos conversaciones activas.
   */
  async asignacionAutomatica(asignadoPor: string, clienteId: string) {
    const cola = await this.colaSinAsignar(clienteId)
    if (cola.length === 0) return { asignadas: 0, mensaje: 'No hay conversaciones en cola.' }

    const disponibles = await this.agenteRepository.find({
      where: {
        clienteId,
        tipoAgente: TipoAgente.HUMANO,
        estadoDisponibilidad: DisponibilidadAgente.DISPONIBLE,
        activo: true,
        estado: Status.ACTIVE,
      },
    })
    if (disponibles.length === 0) return { asignadas: 0, mensaje: 'No hay agentes disponibles.' }

    // Carga actual de cada agente (menos carga = mayor prioridad)
    const carga = await Promise.all(
      disponibles.map(async agente => ({
        agente,
        activas: await this.asignacionRepository.count({
          where: { agenteHumanoId: agente.id, estadoAsignacion: 'activa', estado: Status.ACTIVE },
        }),
      })),
    )

    let asignadas = 0
    for (const conversacion of cola) {
      carga.sort((a, b) => a.activas - b.activas)
      const destino = carga[0]
      await this.asignar(
        {
          conversacionId: conversacion.id,
          agenteHumanoId: destino.agente.id,
          razon: 'Asignación automática por balanceo de carga',
          esEscalada: conversacion.escalado,
        },
        asignadoPor,
        clienteId,
      )
      destino.activas += 1
      asignadas += 1
    }

    return { asignadas, agentesUsados: carga.filter(c => c.activas > 0).length }
  }
}
