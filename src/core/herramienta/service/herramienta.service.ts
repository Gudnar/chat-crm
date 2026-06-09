import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Herramienta } from '../entity/herramienta.entity'
import { CreateHerramientaDto, UpdateHerramientaDto } from '../dto/create-herramienta.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'

@Injectable()
export class HerramientaService extends BaseService {
  constructor(
    @InjectRepository(Herramienta)
    private readonly herramientaRepository: Repository<Herramienta>
  ) {
    super(HerramientaService.name)
  }

  async listarPorAgente(agenteId: string): Promise<Herramienta[]> {
    return this.herramientaRepository.find({
      where: { agenteId, estado: Status.ACTIVE },
      order: { fechaCreacion: 'ASC' },
    })
  }

  async obtener(id: string): Promise<Herramienta> {
    const h = await this.herramientaRepository.findOne({ where: { id, estado: Status.ACTIVE } })
    if (!h) throw new NotFoundException(Messages.HERRAMIENTA_NOT_FOUND)
    return h
  }

  async crear(dto: CreateHerramientaDto, usuarioCreacion: string): Promise<Herramienta> {
    const herramienta = this.herramientaRepository.create({
      ...dto,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.herramientaRepository.save(herramienta)
  }

  async actualizar(id: string, dto: UpdateHerramientaDto, usuarioModificacion: string): Promise<Herramienta> {
    const h = await this.obtener(id)
    Object.assign(h, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.herramientaRepository.save(h)
  }

  async eliminar(id: string, usuarioModificacion: string): Promise<void> {
    const h = await this.obtener(id)
    h.estado = Status.ELIMINATE
    h.transaccion = Transacccion.ELIMINAR
    h.usuarioModificacion = usuarioModificacion
    await this.herramientaRepository.save(h)
  }

  async crearHerramientasPorDefecto(agenteId: string, usuarioCreacion: string): Promise<void> {
    const defaults: Partial<Herramienta>[] = [
      { nombre: 'calificar_lead', label: 'Calificar Lead', descripcion: 'Actualiza el Lead Score (0-100) según el contenido de la conversación.', parametros: ['score: number (0-100)', 'razon: string'], activa: true, autoConfirmar: true, confianzaMinima: 70, color: '#f59e0b', icono: 'qualify', ejemplo: 'calificar_lead({ score: 82, razon: "Mencionó presupuesto" })' },
      { nombre: 'cambiar_estado', label: 'Cambiar Estado', descripcion: 'Cambia el estado de la conversación.', parametros: ["estado: 'nuevo'|'abierto'|'pendiente'|'resuelto'|'cerrado'"], activa: true, autoConfirmar: true, confianzaMinima: 80, color: '#6366f1', icono: 'check' },
      { nombre: 'escalar_agente', label: 'Escalar a Humano', descripcion: 'Transfiere la conversación a un agente humano con contexto completo.', parametros: ["razon: string", "prioridad: 'alta'|'media'|'baja'"], activa: true, autoConfirmar: true, confianzaMinima: 60, color: '#ef4444', icono: 'user' },
      { nombre: 'crear_nota', label: 'Crear Nota Interna', descripcion: 'Agrega una nota interna visible solo para el equipo.', parametros: ['nota: string'], activa: true, autoConfirmar: true, confianzaMinima: 50, color: '#64748b', icono: 'edit' },
    ]

    for (const d of defaults) {
      await this.crear(
        { agenteId, ...d } as CreateHerramientaDto,
        usuarioCreacion
      )
    }
  }
}
