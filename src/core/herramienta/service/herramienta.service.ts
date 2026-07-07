import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Herramienta, ParametroHerramienta } from '../entity/herramienta.entity'
import { CreateHerramientaDto, UpdateHerramientaDto } from '../dto/create-herramienta.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'

export interface ClaudeTool {
  name: string
  description: string
  input_schema: {
    type: 'object'
    properties: Record<string, any>
    required: string[]
  }
}

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
      {
        nombre: 'calificar_lead',
        label: 'Calificar Lead',
        descripcion: 'Actualiza el Lead Score (0-100) según el contenido de la conversación.',
        parametros: [
          { nombre: 'score', tipo: 'integer', descripcion: 'Valor del score entre 0 y 100', requerido: true, minimo: 0, maximo: 100 },
          { nombre: 'razon', tipo: 'string', descripcion: 'Justificación del score asignado', requerido: true },
        ] as any,
        activa: true, autoConfirmar: true, confianzaMinima: 70, color: '#f59e0b', icono: 'qualify',
        ejemplo: 'calificar_lead({ score: 82, razon: "Mencionó presupuesto disponible" })',
      },
      {
        nombre: 'cambiar_estado',
        label: 'Cambiar Estado',
        descripcion: 'Cambia el estado de la conversación.',
        parametros: [
          { nombre: 'estado', tipo: 'enum', descripcion: 'Nuevo estado de la conversación', requerido: true, opciones: ['nuevo', 'abierto', 'pendiente', 'resuelto', 'cerrado'] },
        ] as any,
        activa: true, autoConfirmar: true, confianzaMinima: 80, color: '#6366f1', icono: 'check',
      },
      {
        nombre: 'escalar_agente',
        label: 'Escalar a Humano',
        descripcion: 'Transfiere la conversación a un agente humano con contexto completo.',
        parametros: [
          { nombre: 'razon', tipo: 'string', descripcion: 'Motivo por el que se escala la conversación', requerido: true },
          { nombre: 'prioridad', tipo: 'enum', descripcion: 'Nivel de urgencia', requerido: true, opciones: ['alta', 'media', 'baja'] },
        ] as any,
        activa: true, autoConfirmar: true, confianzaMinima: 60, color: '#ef4444', icono: 'user',
      },
      {
        nombre: 'crear_nota',
        label: 'Crear Nota Interna',
        descripcion: 'Agrega una nota interna visible solo para el equipo.',
        parametros: [
          { nombre: 'nota', tipo: 'string', descripcion: 'Contenido de la nota interna', requerido: true },
        ] as any,
        activa: true, autoConfirmar: true, confianzaMinima: 50, color: '#64748b', icono: 'edit',
      },
      {
        nombre: 'buscar_producto',
        label: 'Buscar Producto',
        descripcion: 'Busca productos en el catálogo según lo que pide el cliente. Úsala cuando pregunten por productos, precios, disponibilidad, marca o modelo.',
        parametros: [
          { nombre: 'termino', tipo: 'string', descripcion: 'Término de búsqueda: nombre, marca, modelo o categoría del producto', requerido: true },
          { nombre: 'categoria', tipo: 'string', descripcion: 'Filtrar por categoría específica (opcional)', requerido: false },
        ] as any,
        activa: true, autoConfirmar: true, confianzaMinima: 50, color: '#10b981', icono: 'search',
        ejemplo: 'buscar_producto({ termino: "zapatillas Nike", categoria: "calzado" })',
      },
    ]

    for (const d of defaults) {
      await this.crear({ agenteId, ...d } as CreateHerramientaDto, usuarioCreacion)
    }
  }

  // ── Claude tool_use integration ──────────────────────────────

  convertirAFormatoClaudeTools(herramientas: Herramienta[]): ClaudeTool[] {
    return herramientas
      .filter(h => h.activa)
      .map(h => ({
        name: h.nombre,
        description: h.descripcion,
        input_schema: this.construirInputSchema(h.parametros as any[]),
      }))
  }

  private construirInputSchema(parametros: any[]): ClaudeTool['input_schema'] {
    const properties: Record<string, any> = {}
    const required: string[] = []

    for (const p of parametros ?? []) {
      if (typeof p === 'string') {
        // Compatibilidad con formato legacy: "nombre: tipo descripcion"
        const { nombre, schema } = this.parsearParametroLegacy(p)
        properties[nombre] = schema
        required.push(nombre)
        continue
      }

      const param = p as ParametroHerramienta

      if (param.tipo === 'enum') {
        properties[param.nombre] = { type: 'string', enum: param.opciones ?? [], description: param.descripcion }
      } else if (param.tipo === 'integer') {
        const schema: any = { type: 'integer', description: param.descripcion }
        if (param.minimo !== undefined) schema.minimum = param.minimo
        if (param.maximo !== undefined) schema.maximum = param.maximo
        properties[param.nombre] = schema
      } else if (param.tipo === 'number') {
        const schema: any = { type: 'number', description: param.descripcion }
        if (param.minimo !== undefined) schema.minimum = param.minimo
        if (param.maximo !== undefined) schema.maximum = param.maximo
        properties[param.nombre] = schema
      } else {
        properties[param.nombre] = { type: param.tipo, description: param.descripcion }
      }

      if (param.requerido) required.push(param.nombre)
    }

    return { type: 'object', properties, required }
  }

  private parsearParametroLegacy(param: string): { nombre: string; schema: any } {
    const colonIdx = param.indexOf(':')
    if (colonIdx === -1) return { nombre: param.trim(), schema: { type: 'string' } }

    const nombre = param.substring(0, colonIdx).trim()
    const resto = param.substring(colonIdx + 1).trim()

    if (resto.includes('|')) {
      const opciones = resto.split('|').map(o => o.replace(/['"()\s]/g, '').trim()).filter(Boolean)
      return { nombre, schema: { type: 'string', enum: opciones, description: resto } }
    }

    if (resto.startsWith('number') || resto.startsWith('int')) {
      return { nombre, schema: { type: 'number', description: resto } }
    }

    return { nombre, schema: { type: 'string', description: resto } }
  }
}
