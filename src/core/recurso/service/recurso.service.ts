import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { existsSync, unlinkSync } from 'fs'
import { join } from 'path'
import { Recurso, TipoRecurso } from '../entity/recurso.entity'
import { CreateRecursoDto, UpdateRecursoDto } from '../dto/create-recurso.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'
import { detectarTipo, LIMITE_BYTES_POR_TIPO, MIME_POR_TIPO, formatearBytes } from '../recurso.constants'

@Injectable()
export class RecursoService extends BaseService {
  constructor(
    @InjectRepository(Recurso)
    private readonly recursoRepository: Repository<Recurso>,
    private readonly configService: ConfigService,
  ) {
    super(RecursoService.name)
  }

  async listar(
    clienteId: string,
    filtros?: { tipo?: TipoRecurso; categoria?: string; activo?: boolean },
  ): Promise<Recurso[]> {
    const where: any = { clienteId, estado: Status.ACTIVE }
    if (filtros?.tipo) where.tipo = filtros.tipo
    if (filtros?.categoria) where.categoria = filtros.categoria
    if (filtros?.activo !== undefined) where.activo = filtros.activo

    return this.recursoRepository.find({
      where,
      order: { fechaCreacion: 'DESC' },
    })
  }

  async obtener(id: string, clienteId: string): Promise<Recurso> {
    const recurso = await this.recursoRepository.findOne({
      where: { id, clienteId, estado: Status.ACTIVE },
    })
    if (!recurso) throw new NotFoundException('Recurso no encontrado')
    return recurso
  }

  async crear(
    dto: CreateRecursoDto,
    file: Express.Multer.File | undefined,
    usuarioCreacion: string,
    clienteId: string,
  ): Promise<Recurso> {
    if (!file && !dto.urlExterna) {
      throw new BadRequestException('Debes proporcionar un archivo o URL externa')
    }

    const recurso = this.recursoRepository.create({
      ...dto,
      keywords: this.normalizarKeywords(dto.keywords),
      clienteId,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })

    if (file) {
      // El tipo se deduce del archivo real, no de lo que declare el cliente: así el
      // registro nunca contradice dónde multer lo dejó ni cómo se enviará por WhatsApp.
      const tipo = detectarTipo(file.mimetype)
      if (!tipo) {
        this.borrarArchivo(file.path)
        throw new BadRequestException(`Tipo de archivo no permitido: ${file.mimetype}`)
      }

      const limite = LIMITE_BYTES_POR_TIPO[tipo]
      if (file.size > limite) {
        // WhatsApp rechazaría el envío: no guardamos un recurso inservible.
        this.borrarArchivo(file.path)
        throw new BadRequestException(
          `El archivo pesa ${formatearBytes(file.size)} y WhatsApp permite hasta ${formatearBytes(limite)} para ${tipo}.`,
        )
      }

      recurso.tipo = tipo
      recurso.archivoLocal = `${tipo.toLowerCase()}/${file.filename}`
      recurso.tamanobytes = file.size
      recurso.mimeType = file.mimetype
    } else if (!recurso.tipo) {
      throw new BadRequestException('Debes indicar el tipo del recurso cuando usas una URL externa')
    }

    return this.recursoRepository.save(recurso)
  }

  /**
   * multipart/form-data no tiene arrays: las keywords pueden llegar como string suelto,
   * como CSV o como JSON. Se normaliza todo a string[] para que la búsqueda funcione.
   */
  private normalizarKeywords(keywords: unknown): string[] {
    if (!keywords) return []
    if (Array.isArray(keywords)) {
      return keywords.map(k => String(k).trim().toLowerCase()).filter(Boolean)
    }
    const texto = String(keywords).trim()
    if (!texto) return []
    if (texto.startsWith('[')) {
      try {
        const parsed = JSON.parse(texto)
        if (Array.isArray(parsed)) return parsed.map(k => String(k).trim().toLowerCase()).filter(Boolean)
      } catch { /* cae al split por comas */ }
    }
    return texto.split(',').map(k => k.trim().toLowerCase()).filter(Boolean)
  }

  private borrarArchivo(ruta?: string): void {
    if (!ruta) return
    try {
      if (existsSync(ruta)) unlinkSync(ruta)
    } catch (err: any) {
      this.logger.warn(`No se pudo borrar el archivo ${ruta}: ${err.message}`)
    }
  }

  async actualizar(
    id: string,
    dto: UpdateRecursoDto,
    usuarioModificacion: string,
    clienteId: string,
  ): Promise<Recurso> {
    const recurso = await this.obtener(id, clienteId)
    Object.assign(recurso, {
      ...dto,
      ...(dto.keywords !== undefined ? { keywords: this.normalizarKeywords(dto.keywords) } : {}),
      transaccion: Transacccion.ACTUALIZAR,
      usuarioModificacion,
    })
    return this.recursoRepository.save(recurso)
  }

  async eliminar(id: string, usuarioModificacion: string, clienteId: string): Promise<void> {
    const recurso = await this.obtener(id, clienteId)

    // Borrado lógico en BD, pero el archivo físico sí se elimina: dejarlo huérfano
    // ocupa disco y mantiene el recurso accesible por URL pese a estar "eliminado".
    if (recurso.archivoLocal) {
      this.borrarArchivo(join(process.cwd(), 'uploads', 'recursos', clienteId, recurso.archivoLocal))
    }

    recurso.estado = Status.ELIMINATE
    recurso.transaccion = Transacccion.ELIMINAR
    recurso.usuarioModificacion = usuarioModificacion
    await this.recursoRepository.save(recurso)
  }

  async buscarPorKeywords(clienteId: string, keyword: string): Promise<Recurso[]> {
    const normalizado = keyword.toLowerCase().trim()
    const recursos = await this.recursoRepository.find({
      where: { clienteId, activo: true, estado: Status.ACTIVE },
    })

    return recursos.filter(
      r =>
        r.nombre.toLowerCase().includes(normalizado) ||
        r.categoria?.toLowerCase().includes(normalizado) ||
        r.keywords.some(k => k.toLowerCase().includes(normalizado)),
    )
  }

  async obtenerUrlPublica(recursoId: string, clienteId: string): Promise<string> {
    const recurso = await this.obtener(recursoId, clienteId)

    if (recurso.urlExterna) {
      return recurso.urlExterna
    }

    if (recurso.archivoLocal) {
      const appUrl = (this.configService.get<string>('APP_URL') || 'http://localhost:3001').replace(/\/$/, '')
      return `${appUrl}/uploads/recursos/${clienteId}/${recurso.archivoLocal}`
    }

    throw new BadRequestException('Recurso no tiene URL')
  }

  obtenerTiposPermitidos(): string[] {
    return Object.values(TipoRecurso)
  }

  obtenerMimeTypesPermitidos(): { [tipo: string]: string[] } {
    return MIME_POR_TIPO
  }

  /** Límites de la WhatsApp Cloud API, para que la UI los muestre antes de subir. */
  obtenerLimites(): { [tipo: string]: { bytes: number; legible: string } } {
    return Object.fromEntries(
      Object.entries(LIMITE_BYTES_POR_TIPO).map(([tipo, bytes]) => [
        tipo,
        { bytes, legible: formatearBytes(bytes) },
      ]),
    )
  }
}
