import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { Agente } from '../../agente/entity/agente.entity'
import { Usuario } from '../../usuario/entity/usuario.entity'
import { AsignacionAgenteHumano } from '../entity/asignacion-agente-humano.entity'
import { ActividadAgenteHumano } from '../entity/actividad-agente-humano.entity'
import { CreateAgenteHumanoDto, UpdateAgenteHumanoDto } from '../dto/agente-humano.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion, Roles, TipoAgente, DisponibilidadAgente, TipoActividadAgente } from '../../../common/constants'

@Injectable()
export class AgenteHumanoService extends BaseService {
  constructor(
    @InjectRepository(Agente)
    private readonly agenteRepository: Repository<Agente>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(AsignacionAgenteHumano)
    private readonly asignacionRepository: Repository<AsignacionAgenteHumano>,
    @InjectRepository(ActividadAgenteHumano)
    private readonly actividadRepository: Repository<ActividadAgenteHumano>,
  ) {
    super(AgenteHumanoService.name)
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async crear(dto: CreateAgenteHumanoDto, usuarioCreacion: string, clienteId: string) {
    const existe = await this.usuarioRepository.findOne({ where: { usuario: dto.usuario } })
    if (existe) throw new ConflictException(`El usuario "${dto.usuario}" ya existe.`)

    // 1. Crear las credenciales de acceso (Usuario con rol AGENTE_HUMANO)
    const nuevoUsuario = this.usuarioRepository.create({
      usuario: dto.usuario,
      contrasena: dto.contrasena, // hasheada por @BeforeInsert
      nombres: dto.nombres,
      apellidos: dto.apellidos,
      correoElectronico: dto.correoElectronico,
      rol: Roles.AGENTE_HUMANO,
      clienteId,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario)

    // 2. Crear el agente humano vinculado a esas credenciales
    const nombreCompleto = [dto.nombres, dto.apellidos].filter(Boolean).join(' ')
    const agente = this.agenteRepository.create({
      nombre: nombreCompleto,
      descripcion: dto.descripcion,
      tipoAgente: TipoAgente.HUMANO,
      usuarioId: usuarioGuardado.id,
      estadoDisponibilidad: DisponibilidadAgente.INACTIVO,
      avatar: dto.avatar || '🧑‍💼',
      color: dto.color || '#22c55e',
      especialidades: dto.especialidades ?? [],
      horasTrabajo: dto.horasTrabajo ?? {},
      clienteId,
      activo: true,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    const agenteGuardado = await this.agenteRepository.save(agente)

    await this.registrarActividad(agenteGuardado.id, clienteId, TipoActividadAgente.ASIGNACION, {
      accion: 'agente_creado',
      creadoPor: usuarioCreacion,
    })

    return this.sanitizar(agenteGuardado, usuarioGuardado)
  }

  async listar(clienteId: string) {
    const agentes = await this.agenteRepository.find({
      where: { clienteId, tipoAgente: TipoAgente.HUMANO, estado: Status.ACTIVE },
      order: { fechaCreacion: 'ASC' },
    })
    if (agentes.length === 0) return []

    const usuarioIds = agentes.map(a => a.usuarioId).filter(Boolean) as string[]
    const usuarios = usuarioIds.length
      ? await this.usuarioRepository.findByIds(usuarioIds)
      : []
    const usuariosMap = Object.fromEntries(usuarios.map(u => [u.id, u]))

    const conActivas = await Promise.all(
      agentes.map(async a => {
        const activas = await this.asignacionRepository.count({
          where: { agenteHumanoId: a.id, estadoAsignacion: 'activa', estado: Status.ACTIVE },
        })
        return this.sanitizar(a, usuariosMap[a.usuarioId as string], activas)
      }),
    )
    return conActivas
  }

  async obtener(id: string, clienteId: string) {
    const agente = await this.agenteRepository.findOne({
      where: { id, clienteId, tipoAgente: TipoAgente.HUMANO, estado: Status.ACTIVE },
    })
    if (!agente) throw new NotFoundException('El agente humano no fue encontrado.')
    const usuario = agente.usuarioId
      ? await this.usuarioRepository.findOne({ where: { id: agente.usuarioId } })
      : null
    return this.sanitizar(agente, usuario)
  }

  async obtenerPorUsuarioId(usuarioId: string): Promise<Agente | null> {
    return this.agenteRepository.findOne({
      where: { usuarioId, tipoAgente: TipoAgente.HUMANO, estado: Status.ACTIVE },
    })
  }

  async actualizar(id: string, dto: UpdateAgenteHumanoDto, usuarioModificacion: string, clienteId: string) {
    const agente = await this.agenteRepository.findOne({
      where: { id, clienteId, tipoAgente: TipoAgente.HUMANO, estado: Status.ACTIVE },
    })
    if (!agente) throw new NotFoundException('El agente humano no fue encontrado.')

    // Actualizar credenciales / datos personales en Usuario
    let usuario: Usuario | null = null
    if (agente.usuarioId) {
      usuario = await this.usuarioRepository.findOne({ where: { id: agente.usuarioId } })
      if (usuario) {
        if (dto.nombres !== undefined) usuario.nombres = dto.nombres
        if (dto.apellidos !== undefined) usuario.apellidos = dto.apellidos
        if (dto.correoElectronico !== undefined) usuario.correoElectronico = dto.correoElectronico
        if (dto.contrasena) usuario.contrasena = await bcrypt.hash(dto.contrasena, 10)
        usuario.transaccion = Transacccion.ACTUALIZAR
        usuario.usuarioModificacion = usuarioModificacion
        usuario = await this.usuarioRepository.save(usuario)
      }
    }

    // Actualizar datos del agente
    if (dto.nombres !== undefined || dto.apellidos !== undefined) {
      const nombres = dto.nombres ?? usuario?.nombres ?? agente.nombre
      const apellidos = dto.apellidos ?? usuario?.apellidos ?? ''
      agente.nombre = [nombres, apellidos].filter(Boolean).join(' ')
    }
    if (dto.descripcion !== undefined) agente.descripcion = dto.descripcion
    if (dto.avatar !== undefined) agente.avatar = dto.avatar
    if (dto.color !== undefined) agente.color = dto.color
    if (dto.especialidades !== undefined) agente.especialidades = dto.especialidades
    if (dto.horasTrabajo !== undefined) agente.horasTrabajo = dto.horasTrabajo
    if (dto.activo !== undefined) agente.activo = dto.activo
    agente.transaccion = Transacccion.ACTUALIZAR
    agente.usuarioModificacion = usuarioModificacion

    const guardado = await this.agenteRepository.save(agente)
    return this.sanitizar(guardado, usuario)
  }

  async eliminar(id: string, usuarioModificacion: string, clienteId: string): Promise<void> {
    const agente = await this.agenteRepository.findOne({
      where: { id, clienteId, tipoAgente: TipoAgente.HUMANO, estado: Status.ACTIVE },
    })
    if (!agente) throw new NotFoundException('El agente humano no fue encontrado.')

    // Cerrar asignaciones activas para que las conversaciones vuelvan a la cola
    await this.asignacionRepository.update(
      { agenteHumanoId: id, estadoAsignacion: 'activa' },
      { estadoAsignacion: 'cerrada', fechaCierre: new Date(), transaccion: Transacccion.ACTUALIZAR },
    )

    Object.assign(agente, {
      estado: Status.ELIMINATE,
      transaccion: Transacccion.ELIMINAR,
      usuarioModificacion,
      sesionActiva: false,
      estadoDisponibilidad: DisponibilidadAgente.INACTIVO,
    })
    await this.agenteRepository.save(agente)

    // Desactivar sus credenciales de acceso
    if (agente.usuarioId) {
      await this.usuarioRepository.update(agente.usuarioId, {
        estado: Status.ELIMINATE,
        transaccion: Transacccion.ELIMINAR,
        usuarioModificacion,
      })
    }
  }

  // ── Disponibilidad y sesiones ─────────────────────────────────────────────

  async cambiarDisponibilidad(agenteId: string, estado: string, clienteId: string) {
    const agente = await this.agenteRepository.findOne({
      where: { id: agenteId, clienteId, tipoAgente: TipoAgente.HUMANO, estado: Status.ACTIVE },
    })
    if (!agente) throw new NotFoundException('El agente humano no fue encontrado.')

    const anterior = agente.estadoDisponibilidad
    agente.estadoDisponibilidad = estado
    agente.transaccion = Transacccion.ACTUALIZAR
    await this.agenteRepository.save(agente)

    await this.registrarActividad(agenteId, clienteId, TipoActividadAgente.CAMBIO_ESTADO, {
      de: anterior,
      a: estado,
    })
    return { estadoDisponibilidad: estado }
  }

  async obtenerDisponibles(clienteId: string) {
    const agentes = await this.agenteRepository.find({
      where: {
        clienteId,
        tipoAgente: TipoAgente.HUMANO,
        estadoDisponibilidad: DisponibilidadAgente.DISPONIBLE,
        activo: true,
        estado: Status.ACTIVE,
      },
    })
    return agentes.map(a => this.sanitizar(a, null))
  }

  /** Marca la sesión activa al hacer login (llamado desde AuthenticationService). */
  async registrarSesion(usuarioId: string): Promise<void> {
    const agente = await this.obtenerPorUsuarioId(usuarioId)
    if (!agente) return
    agente.sesionActiva = true
    agente.ultimoAcceso = new Date()
    if (agente.estadoDisponibilidad === DisponibilidadAgente.INACTIVO) {
      agente.estadoDisponibilidad = DisponibilidadAgente.DISPONIBLE
    }
    agente.transaccion = Transacccion.ACTUALIZAR
    await this.agenteRepository.save(agente)
    await this.registrarActividad(agente.id, agente.clienteId, TipoActividadAgente.LOGIN, {})
  }

  /** Cierra la sesión del agente (llamado desde AuthenticationService). */
  async cerrarSesion(usuarioId: string): Promise<void> {
    const agente = await this.obtenerPorUsuarioId(usuarioId)
    if (!agente) return
    agente.sesionActiva = false
    agente.estadoDisponibilidad = DisponibilidadAgente.INACTIVO
    agente.transaccion = Transacccion.ACTUALIZAR
    await this.agenteRepository.save(agente)
    await this.registrarActividad(agente.id, agente.clienteId, TipoActividadAgente.LOGOUT, {})
  }

  // ── Estadísticas y actividad ──────────────────────────────────────────────

  async estadisticas(agenteId: string, clienteId: string) {
    const agente = await this.agenteRepository.findOne({
      where: { id: agenteId, clienteId, tipoAgente: TipoAgente.HUMANO, estado: Status.ACTIVE },
    })
    if (!agente) throw new NotFoundException('El agente humano no fue encontrado.')

    const base = { agenteHumanoId: agenteId, estado: Status.ACTIVE }
    const [totalAsignadas, activas, resueltas, escaladas] = await Promise.all([
      this.asignacionRepository.count({ where: base }),
      this.asignacionRepository.count({ where: { ...base, estadoAsignacion: 'activa' } }),
      this.asignacionRepository.count({ where: { ...base, estadoAsignacion: 'cerrada' } }),
      this.asignacionRepository.count({ where: { ...base, fueEscalada: true } }),
    ])

    const tiempoRow = await this.asignacionRepository
      .createQueryBuilder('a')
      .select('COALESCE(AVG(a.tiempo_atencion_segundos), 0)', 'avg')
      .where('a.agente_humano_id = :agenteId', { agenteId })
      .andWhere('a.tiempo_atencion_segundos IS NOT NULL')
      .getRawOne()
    const tiempoPromedioMinutos = Math.round(parseFloat(tiempoRow?.avg || '0') / 60)

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const asignadasHoy = await this.asignacionRepository
      .createQueryBuilder('a')
      .where('a.agente_humano_id = :agenteId', { agenteId })
      .andWhere('a.fecha_asignacion >= :hoy', { hoy })
      .getCount()

    return {
      agenteId,
      nombre: agente.nombre,
      estadoDisponibilidad: agente.estadoDisponibilidad,
      sesionActiva: agente.sesionActiva,
      ultimoAcceso: agente.ultimoAcceso,
      totalAsignadas,
      activas,
      resueltas,
      escaladas,
      asignadasHoy,
      tiempoPromedioMinutos,
      tasaResolucion: totalAsignadas > 0 ? Math.round((resueltas / totalAsignadas) * 100) : 0,
    }
  }

  async estadisticasEquipo(clienteId: string) {
    const agentes = await this.agenteRepository.find({
      where: { clienteId, tipoAgente: TipoAgente.HUMANO, estado: Status.ACTIVE },
    })
    return Promise.all(agentes.map(a => this.estadisticas(a.id, clienteId)))
  }

  async actividad(agenteId: string, clienteId: string, limite = 50) {
    return this.actividadRepository.find({
      where: { agenteHumanoId: agenteId, clienteId },
      order: { timestamp: 'DESC' },
      take: limite,
    })
  }

  async registrarActividad(
    agenteHumanoId: string,
    clienteId: string,
    tipoActividad: string,
    detalles: Record<string, any>,
    conversacionId?: string,
  ): Promise<void> {
    const registro = this.actividadRepository.create({
      agenteHumanoId,
      clienteId,
      tipoActividad,
      detalles,
      conversacionId: conversacionId ?? null,
    })
    await this.actividadRepository.save(registro)
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private sanitizar(agente: Agente, usuario?: Usuario | null, conversacionesActivas?: number) {
    return {
      id: agente.id,
      nombre: agente.nombre,
      descripcion: agente.descripcion,
      tipoAgente: agente.tipoAgente,
      avatar: agente.avatar,
      color: agente.color,
      activo: agente.activo,
      estadoDisponibilidad: agente.estadoDisponibilidad,
      sesionActiva: agente.sesionActiva,
      ultimoAcceso: agente.ultimoAcceso,
      especialidades: agente.especialidades,
      horasTrabajo: agente.horasTrabajo,
      clienteId: agente.clienteId,
      usuarioId: agente.usuarioId,
      fechaCreacion: agente.fechaCreacion,
      ...(conversacionesActivas !== undefined && { conversacionesActivas }),
      ...(usuario && {
        credenciales: {
          usuario: usuario.usuario,
          nombres: usuario.nombres,
          apellidos: usuario.apellidos,
          correoElectronico: usuario.correoElectronico,
        },
      }),
    }
  }
}
