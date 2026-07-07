import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseConocimiento } from '../entity/base-conocimiento.entity'
import { CreateBaseConocimientoDto, UpdateBaseConocimientoDto } from '../dto/create-base-conocimiento.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'

@Injectable()
export class BaseConocimientoService extends BaseService {
  constructor(
    @InjectRepository(BaseConocimiento)
    private readonly repo: Repository<BaseConocimiento>,
  ) {
    super(BaseConocimientoService.name)
  }

  async listarPorAgente(agenteId: string): Promise<BaseConocimiento[]> {
    return this.repo.find({
      where: { agenteId, estado: Status.ACTIVE },
      order: { orden: 'ASC', fechaCreacion: 'ASC' },
    })
  }

  async obtener(id: string): Promise<BaseConocimiento> {
    const faq = await this.repo.findOne({ where: { id, estado: Status.ACTIVE } })
    if (!faq) throw new NotFoundException('Pregunta frecuente no encontrada')
    return faq
  }

  async crear(dto: CreateBaseConocimientoDto, usuarioCreacion: string): Promise<BaseConocimiento> {
    const faq = this.repo.create({
      ...dto,
      activo: true,
      orden: dto.orden ?? 0,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.repo.save(faq)
  }

  async actualizar(id: string, dto: UpdateBaseConocimientoDto, usuarioModificacion: string): Promise<BaseConocimiento> {
    const faq = await this.obtener(id)
    Object.assign(faq, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(faq)
  }

  async eliminar(id: string, usuarioModificacion: string): Promise<void> {
    const faq = await this.obtener(id)
    faq.estado = Status.ELIMINATE
    faq.transaccion = Transacccion.ELIMINAR
    faq.usuarioModificacion = usuarioModificacion
    await this.repo.save(faq)
  }

  // Construye el bloque de texto que se inyecta en el system prompt de Claude
  async construirContexto(agenteId: string): Promise<string> {
    const todas = await this.listarPorAgente(agenteId)
    const activas = todas.filter(f => f.activo)
    if (!activas.length) return ''

    const lineas: string[] = ['=== PREGUNTAS FRECUENTES ===']

    // Agrupar por categoría
    const grupos = new Map<string, BaseConocimiento[]>()
    const sinCategoria: BaseConocimiento[] = []

    for (const faq of activas) {
      if (faq.categoria) {
        if (!grupos.has(faq.categoria)) grupos.set(faq.categoria, [])
        grupos.get(faq.categoria)!.push(faq)
      } else {
        sinCategoria.push(faq)
      }
    }

    for (const [cat, items] of grupos) {
      lineas.push(`\n[${cat.toUpperCase()}]`)
      for (const faq of items) {
        lineas.push(`P: ${faq.pregunta}`)
        lineas.push(`R: ${faq.respuesta}`)
      }
    }

    if (sinCategoria.length) {
      if (grupos.size > 0) lineas.push('\n[GENERAL]')
      for (const faq of sinCategoria) {
        lineas.push(`P: ${faq.pregunta}`)
        lineas.push(`R: ${faq.respuesta}`)
      }
    }

    lineas.push('=== FIN PREGUNTAS FRECUENTES ===')
    return lineas.join('\n')
  }
}
