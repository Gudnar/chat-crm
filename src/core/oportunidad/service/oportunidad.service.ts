import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { HistorialOportunidad, OportunidadVenta } from '../entity/oportunidad-venta.entity'
import { Conversacion } from '../../conversacion/entity/conversacion.entity'
import { Usuario } from '../../usuario/entity/usuario.entity'
import {
  CreateOportunidadDto,
  RegistrarSeguimientoDto,
  UpdateOportunidadDto,
} from '../dto/oportunidad.dto'
import { BaseService } from '../../../common/base/base-service'
import {
  ESTADOS_OPORTUNIDAD_FINALES,
  EstadoOportunidad,
  Roles,
  Status,
  Transacccion,
} from '../../../common/constants'

export interface FiltrosOportunidad {
  q?: string
  estadoOportunidad?: string
  prioridad?: string
  asignadoA?: string
}

@Injectable()
export class OportunidadService extends BaseService {
  constructor(
    @InjectRepository(OportunidadVenta)
    private readonly repo: Repository<OportunidadVenta>,
    @InjectRepository(Conversacion)
    private readonly conversacionRepo: Repository<Conversacion>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {
    super(OportunidadService.name)
  }

  // ── Helpers ───────────────────────────────────────────────────

  private async nombreUsuario(usuarioId: string): Promise<string> {
    if (!usuarioId) return 'Sistema'
    const u = await this.usuarioRepo.findOne({ where: { id: usuarioId } })
    return u ? `${u.nombres}${u.apellidos ? ' ' + u.apellidos : ''}` : `Usuario ${usuarioId}`
  }

  private entradaHistorial(
    accion: string,
    usuarioId: string,
    usuarioNombre: string,
    detalles: string,
  ): HistorialOportunidad {
    return { timestamp: new Date().toISOString(), accion, usuarioId, usuarioNombre, detalles }
  }

  /**
   * Sincroniza datos derivados de la conversación vinculada:
   * - contactoNombre: el nombre asignado al contacto en la Bandeja (notas "Nombre: X"),
   *   se mantiene actualizado si el usuario lo renombra después.
   * - fechaPrimerContacto: timestamp del primer mensaje del contacto (backfill si falta).
   */
  private async sincronizarDesdeConversacion(items: OportunidadVenta[]): Promise<void> {
    const conConversacion = items.filter(o => o.conversacionId)
    if (!conConversacion.length) return

    const ids = [...new Set(conConversacion.map(o => String(o.conversacionId)))]
    const convs = await this.conversacionRepo.find({ where: { id: In(ids) } })
    const porId = new Map(convs.map(c => [String(c.id), c]))

    for (const o of conConversacion) {
      const conv = porId.get(String(o.conversacionId))
      if (!conv) continue

      const updates: Partial<OportunidadVenta> = {}

      const nombreAsignado = conv.notas && conv.notas.startsWith('Nombre:')
        ? conv.notas.replace('Nombre:', '').trim()
        : null
      if (nombreAsignado && o.contactoNombre !== nombreAsignado) {
        updates.contactoNombre = nombreAsignado
      }

      if (!o.fechaPrimerContacto) {
        const primerMensaje = (conv.mensajes || []).find(m => m.role === 'user') || (conv.mensajes || [])[0]
        const fecha = primerMensaje?.timestamp ? new Date(primerMensaje.timestamp) : conv.fechaCreacion || null
        if (fecha) updates.fechaPrimerContacto = fecha
      }

      if (Object.keys(updates).length) {
        Object.assign(o, updates)
        await this.repo.update(o.id, updates)
      }
    }
  }

  private async generarNumero(clienteId: string): Promise<string> {
    // Correlativo por cliente sobre todas las oportunidades (incluye eliminadas para no repetir número)
    const ultimo = await this.repo.createQueryBuilder('o')
      .select('MAX(o.id)', 'max')
      .where('o.clienteId = :clienteId', { clienteId })
      .getRawOne()
    const siguiente = (parseInt(ultimo?.max, 10) || 0) + 1
    return `OPP-${String(siguiente).padStart(4, '0')}-${clienteId}`
  }

  // ── CRUD ──────────────────────────────────────────────────────

  async listar(
    clienteId: string,
    filtros: FiltrosOportunidad = {},
    pagina = 1,
    limite = 25,
  ): Promise<{ items: OportunidadVenta[]; total: number; pagina: number; totalPaginas: number; limite: number }> {
    const qb = this.repo.createQueryBuilder('o')
      .where('o.clienteId = :clienteId', { clienteId })
      .andWhere('o.estado = :estado', { estado: Status.ACTIVE })

    if (filtros.estadoOportunidad) {
      qb.andWhere('o.estadoOportunidad = :estadoOportunidad', { estadoOportunidad: filtros.estadoOportunidad })
    }
    if (filtros.prioridad) qb.andWhere('o.prioridad = :prioridad', { prioridad: filtros.prioridad })
    if (filtros.asignadoA) qb.andWhere('o.asignadoA = :asignadoA', { asignadoA: filtros.asignadoA })
    if (filtros.q) {
      qb.andWhere(
        '(o.contactoNombre ILIKE :q OR o.empresa ILIKE :q OR o.contactoTelefono ILIKE :q OR o.productoInteres ILIKE :q OR o.numeroOportunidad ILIKE :q)',
        { q: `%${filtros.q}%` },
      )
    }

    const total = await qb.getCount()
    const totalPaginas = Math.max(1, Math.ceil(total / limite))
    const paginaSegura = Math.min(Math.max(1, pagina), totalPaginas)

    const items = await qb.clone()
      .orderBy('o.fechaCreacion', 'DESC')
      .skip((paginaSegura - 1) * limite)
      .take(limite)
      .getMany()

    await this.sincronizarDesdeConversacion(items)

    return { items, total, pagina: paginaSegura, totalPaginas, limite }
  }

  async obtener(id: string, clienteId: string): Promise<OportunidadVenta> {
    const o = await this.repo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!o) throw new NotFoundException('Oportunidad no encontrada')
    await this.sincronizarDesdeConversacion([o])
    return o
  }

  async crear(dto: CreateOportunidadDto, clienteId: string, usuarioId: string): Promise<OportunidadVenta> {
    const usuarioNombre = await this.nombreUsuario(usuarioId)
    const numeroOportunidad = await this.generarNumero(clienteId)

    // Si viene de una conversación, completar datos del contacto
    let contactoNombre = dto.contactoNombre
    let contactoTelefono = dto.contactoTelefono
    let origen = dto.origen
    let fechaPrimerContacto: Date | null = null
    if (dto.conversacionId) {
      const conv = await this.conversacionRepo.findOne({
        where: { id: dto.conversacionId, clienteId, estado: Status.ACTIVE },
      })
      if (conv) {
        // Nombre asignado al contacto (guardado en notas como "Nombre: X"), si existe
        const nombreAsignado = conv.notas && conv.notas.startsWith('Nombre:')
          ? conv.notas.replace('Nombre:', '').trim()
          : null
        contactoNombre = nombreAsignado || contactoNombre || conv.contacto
        contactoTelefono = contactoTelefono || conv.contacto
        origen = origen || (conv.canal === 'chat' ? 'web' : conv.canal)
        // Fecha y hora del primer mensaje del contacto
        const primerMensaje = (conv.mensajes || []).find(m => m.role === 'user') || (conv.mensajes || [])[0]
        fechaPrimerContacto = primerMensaje?.timestamp
          ? new Date(primerMensaje.timestamp)
          : conv.fechaCreacion || null
      }
    }

    let asignadoNombre: string | null = null
    if (dto.asignadoA) asignadoNombre = await this.nombreUsuario(dto.asignadoA)

    const oportunidad = this.repo.create({
      numeroOportunidad,
      estadoOportunidad: EstadoOportunidad.PROSPECTO,
      prioridad: dto.prioridad || 'media',
      montoEstimado: dto.montoEstimado ?? null,
      moneda: dto.moneda || 'USD',
      contactoNombre,
      contactoTelefono: contactoTelefono || null,
      contactoEmail: dto.contactoEmail || null,
      empresa: dto.empresa || null,
      origen: origen || 'otro',
      productoInteres: dto.productoInteres || null,
      conversacionId: dto.conversacionId || null,
      fechaPrimerContacto,
      asignadoA: dto.asignadoA || null,
      asignadoNombre,
      notas: dto.notas || null,
      historial: [
        this.entradaHistorial('creacion', usuarioId, usuarioNombre, `Oportunidad ${numeroOportunidad} creada`),
      ],
      clienteId,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion: usuarioId,
    })
    return this.repo.save(oportunidad)
  }

  async actualizar(id: string, dto: UpdateOportunidadDto, clienteId: string, usuarioId: string): Promise<OportunidadVenta> {
    const o = await this.obtener(id, clienteId)
    const usuarioNombre = await this.nombreUsuario(usuarioId)

    const cambios = Object.entries(dto)
      .filter(([k, v]) => v !== undefined && (o as any)[k] !== v)
      .map(([k]) => k)

    Object.assign(o, dto)
    if (cambios.length) {
      o.historial = [
        ...(o.historial || []),
        this.entradaHistorial('edicion', usuarioId, usuarioNombre, `Campos editados: ${cambios.join(', ')}`),
      ]
    }
    o.transaccion = Transacccion.ACTUALIZAR
    o.usuarioModificacion = usuarioId
    return this.repo.save(o)
  }

  async cambiarEstado(
    id: string,
    nuevoEstado: string,
    motivo: string | undefined,
    clienteId: string,
    usuarioId: string,
  ): Promise<OportunidadVenta> {
    const o = await this.obtener(id, clienteId)
    if (o.estadoOportunidad === nuevoEstado) return o

    const esFinal = ESTADOS_OPORTUNIDAD_FINALES.includes(nuevoEstado)
    if ((nuevoEstado === EstadoOportunidad.PERDIDA || nuevoEstado === EstadoOportunidad.CANCELADA) && !motivo) {
      throw new BadRequestException('Debes indicar el motivo al marcar la oportunidad como perdida o cancelada')
    }

    const usuarioNombre = await this.nombreUsuario(usuarioId)
    const detalles = `${o.estadoOportunidad} → ${nuevoEstado}${motivo ? ` — ${motivo}` : ''}`

    o.estadoOportunidad = nuevoEstado
    if (esFinal) {
      o.fechaCierre = new Date()
      o.motivoCierre = motivo || null
      o.proximaAccion = null
      o.proximaAccionFecha = null
    } else if (o.fechaCierre) {
      // Reapertura desde un estado final
      o.fechaCierre = null
      o.motivoCierre = null
    }

    o.historial = [...(o.historial || []), this.entradaHistorial('cambio-estado', usuarioId, usuarioNombre, detalles)]
    o.transaccion = Transacccion.ACTUALIZAR
    o.usuarioModificacion = usuarioId
    return this.repo.save(o)
  }

  async asignar(id: string, asignadoA: string, clienteId: string, usuarioId: string): Promise<OportunidadVenta> {
    const o = await this.obtener(id, clienteId)
    const usuarioNombre = await this.nombreUsuario(usuarioId)
    const asignadoNombre = await this.nombreUsuario(asignadoA)

    o.asignadoA = asignadoA
    o.asignadoNombre = asignadoNombre
    o.historial = [
      ...(o.historial || []),
      this.entradaHistorial('asignacion', usuarioId, usuarioNombre, `Asignada a ${asignadoNombre}`),
    ]
    o.transaccion = Transacccion.ACTUALIZAR
    o.usuarioModificacion = usuarioId
    return this.repo.save(o)
  }

  /**
   * Registro de seguimiento: quién hizo qué y cuándo queda en el historial,
   * y opcionalmente se programa la próxima acción.
   */
  async registrarSeguimiento(
    id: string,
    dto: RegistrarSeguimientoDto,
    clienteId: string,
    usuarioId: string,
  ): Promise<OportunidadVenta> {
    if (!dto.nota && !dto.proximaAccion) {
      throw new BadRequestException('Debes escribir una nota o indicar la próxima acción')
    }

    const o = await this.obtener(id, clienteId)
    const usuarioNombre = await this.nombreUsuario(usuarioId)

    // Se puede registrar solo la nota, solo la próxima acción, o ambas
    const detalles = dto.nota
      ? dto.nota
      : `Programó próxima acción: ${dto.proximaAccion}${dto.proximaAccionFecha ? ` (límite ${new Date(dto.proximaAccionFecha).toLocaleString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })})` : ''}`

    o.historial = [...(o.historial || []), this.entradaHistorial('seguimiento', usuarioId, usuarioNombre, detalles)]
    if (dto.proximaAccion !== undefined) o.proximaAccion = dto.proximaAccion || null
    if (dto.proximaAccionFecha !== undefined) {
      o.proximaAccionFecha = dto.proximaAccionFecha ? new Date(dto.proximaAccionFecha) : null
    }
    o.transaccion = Transacccion.ACTUALIZAR
    o.usuarioModificacion = usuarioId
    return this.repo.save(o)
  }

  /** Edita el texto de una entrada del historial (solo seguimientos y notas, queda marcada como editada). */
  async editarHistorial(
    id: string,
    indice: number,
    detalles: string,
    clienteId: string,
    usuarioId: string,
  ): Promise<OportunidadVenta> {
    const o = await this.obtener(id, clienteId)
    const historial = [...(o.historial || [])]
    const entrada = historial[indice]

    if (!entrada) throw new BadRequestException('La entrada del historial no existe')
    if (!['seguimiento', 'nota'].includes(entrada.accion)) {
      throw new BadRequestException('Solo se pueden editar seguimientos y notas (los cambios de estado y asignaciones son registro de auditoría)')
    }

    const usuarioNombre = await this.nombreUsuario(usuarioId)
    historial[indice] = {
      ...entrada,
      detalles,
      editado: true,
      editadoPor: usuarioNombre,
      editadoEn: new Date().toISOString(),
    } as any

    o.historial = historial
    o.transaccion = Transacccion.ACTUALIZAR
    o.usuarioModificacion = usuarioId
    return this.repo.save(o)
  }

  async eliminar(id: string, clienteId: string, usuarioId: string): Promise<void> {
    const o = await this.obtener(id, clienteId)
    o.estado = Status.ELIMINATE
    o.transaccion = Transacccion.ELIMINAR
    o.usuarioModificacion = usuarioId
    await this.repo.save(o)
  }

  // ── Estadísticas del pipeline ─────────────────────────────────

  async estadisticas(clienteId: string, asignadoA?: string): Promise<any> {
    const qbBase = () => {
      const qb = this.repo.createQueryBuilder('o')
        .where('o.clienteId = :clienteId', { clienteId })
        .andWhere('o.estado = :estado', { estado: Status.ACTIVE })
      if (asignadoA) qb.andWhere('o.asignadoA = :asignadoA', { asignadoA })
      return qb
    }

    const total = await qbBase().getCount()

    const porEstadoRaw = await qbBase()
      .select('o.estadoOportunidad', 'estado')
      .addSelect('COUNT(*)', 'count')
      .groupBy('o.estadoOportunidad')
      .getRawMany()
    const porEstado = porEstadoRaw.reduce((acc, r) => {
      acc[r.estado] = parseInt(r.count, 10)
      return acc
    }, {} as Record<string, number>)

    // Monto en pipeline: oportunidades abiertas (no finales)
    const pipelineRow = await qbBase()
      .select('COALESCE(SUM(o.montoEstimado), 0)', 'suma')
      .andWhere('o.estadoOportunidad NOT IN (:...finales)', { finales: ESTADOS_OPORTUNIDAD_FINALES })
      .getRawOne()

    const ganadoRow = await qbBase()
      .select('COALESCE(SUM(o.montoEstimado), 0)', 'suma')
      .andWhere('o.estadoOportunidad = :ganada', { ganada: EstadoOportunidad.GANADA })
      .getRawOne()

    const ganadas = porEstado[EstadoOportunidad.GANADA] || 0
    const perdidas = porEstado[EstadoOportunidad.PERDIDA] || 0
    const canceladas = porEstado[EstadoOportunidad.CANCELADA] || 0
    const cerradas = ganadas + perdidas + canceladas
    const abiertas = total - cerradas

    const vencidas = await qbBase()
      .andWhere('o.proximaAccionFecha < NOW()')
      .andWhere('o.estadoOportunidad NOT IN (:...finales)', { finales: ESTADOS_OPORTUNIDAD_FINALES })
      .getCount()

    return {
      total,
      abiertas,
      ganadas,
      perdidas,
      canceladas,
      porEstado,
      montoPipeline: parseFloat(pipelineRow?.suma || '0'),
      montoGanado: parseFloat(ganadoRow?.suma || '0'),
      tasaConversion: cerradas > 0 ? Math.round((ganadas / cerradas) * 100) : 0,
      seguimientosVencidos: vencidas,
    }
  }

  // ── Responsables asignables: el equipo de agentes humanos ────

  async usuariosAsignables(clienteId: string): Promise<Array<{ id: string; nombre: string; rol: string }>> {
    const usuarios = await this.usuarioRepo.createQueryBuilder('u')
      .where('u.estado = :estado', { estado: Status.ACTIVE })
      .andWhere('u.rol = :rol', { rol: Roles.AGENTE_HUMANO })
      .andWhere('u.clienteId = :clienteId', { clienteId })
      .orderBy('u.nombres', 'ASC')
      .getMany()
    return usuarios.map(u => ({
      id: u.id,
      nombre: `${u.nombres}${u.apellidos ? ' ' + u.apellidos : ''}`,
      rol: u.rol,
    }))
  }
}
