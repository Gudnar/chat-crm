import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { ArticuloTienda } from '../entity/articulo-tienda.entity'
import { CategoriaTienda } from '../entity/categoria-tienda.entity'
import { ArticuloSucursal } from '../entity/articulo-sucursal.entity'
import { CreateArticuloTiendaDto, UpdateArticuloTiendaDto } from '../dto/articulo-tienda.dto'
import { CreateCategoriaTiendaDto, UpdateCategoriaTiendaDto } from '../dto/categoria-tienda.dto'
import { DisponibilidadSucursalDto } from '../dto/disponibilidad-tienda.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'
import { redimensionarImagen, PresetImagen } from '../../../common/lib/imagen.util'
import { baseUrlAssets } from '../../../common/lib/url-assets.util'

@Injectable()
export class TiendaService extends BaseService {
  constructor(
    @InjectRepository(ArticuloTienda)
    private readonly repo: Repository<ArticuloTienda>,
    @InjectRepository(CategoriaTienda)
    private readonly categoriaRepo: Repository<CategoriaTienda>,
    @InjectRepository(ArticuloSucursal)
    private readonly articuloSucursalRepo: Repository<ArticuloSucursal>,
  ) {
    super(TiendaService.name)
  }

  construirUrlImagen(filename: string): string {
    return `${baseUrlAssets()}/uploads/${filename}`
  }

  /** Redimensiona al tamaño recomendado del preset, guarda el .webp resultante en /uploads/tienda y devuelve la URL pública. */
  async guardarImagenProcesada(buffer: Buffer, preset: PresetImagen): Promise<string> {
    const procesada = await redimensionarImagen(buffer, preset)
    const dir = join(process.cwd(), 'uploads', 'tienda')
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    const filename = `tienda/${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`
    writeFileSync(join(process.cwd(), 'uploads', filename), procesada)
    return this.construirUrlImagen(filename)
  }

  // ── Artículos ────────────────────────────────────────────────

  async listar(clienteId: string): Promise<ArticuloTienda[]> {
    return this.repo.find({
      where: { clienteId, estado: Status.ACTIVE },
      order: { orden: 'ASC', fechaCreacion: 'DESC' },
    })
  }

  async obtener(id: string, clienteId: string): Promise<ArticuloTienda> {
    const articulo = await this.repo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!articulo) throw new NotFoundException('Artículo no encontrado')
    return articulo
  }

  async crear(dto: CreateArticuloTiendaDto, clienteId: string, usuarioCreacion: string): Promise<ArticuloTienda> {
    const articulo = this.repo.create({
      ...dto,
      clienteId,
      moneda: dto.moneda || 'Bs',
      gruposOpciones: dto.gruposOpciones ?? [],
      activo: true,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.repo.save(articulo)
  }

  async actualizar(id: string, dto: UpdateArticuloTiendaDto, clienteId: string, usuarioModificacion: string): Promise<ArticuloTienda> {
    const articulo = await this.obtener(id, clienteId)
    Object.assign(articulo, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(articulo)
  }

  async eliminar(id: string, clienteId: string, usuarioModificacion: string): Promise<void> {
    const articulo = await this.obtener(id, clienteId)
    articulo.estado = Status.ELIMINATE
    articulo.transaccion = Transacccion.ELIMINAR
    articulo.usuarioModificacion = usuarioModificacion
    await this.repo.save(articulo)
  }

  async setImagen(id: string, url: string, clienteId: string, usuarioModificacion: string): Promise<ArticuloTienda> {
    const articulo = await this.obtener(id, clienteId)
    articulo.imagenUrl = url
    articulo.transaccion = Transacccion.ACTUALIZAR
    articulo.usuarioModificacion = usuarioModificacion
    return this.repo.save(articulo)
  }

  // ── Categorías ───────────────────────────────────────────────

  async listarCategorias(clienteId: string): Promise<CategoriaTienda[]> {
    return this.categoriaRepo.find({
      where: { clienteId, estado: Status.ACTIVE },
      order: { orden: 'ASC', nombre: 'ASC' },
    })
  }

  async obtenerCategoria(id: string, clienteId: string): Promise<CategoriaTienda> {
    const categoria = await this.categoriaRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!categoria) throw new NotFoundException('Categoría no encontrada')
    return categoria
  }

  async crearCategoria(dto: CreateCategoriaTiendaDto, clienteId: string, usuarioCreacion: string): Promise<CategoriaTienda> {
    const categoria = this.categoriaRepo.create({
      ...dto,
      clienteId,
      activo: true,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.categoriaRepo.save(categoria)
  }

  async actualizarCategoria(id: string, dto: UpdateCategoriaTiendaDto, clienteId: string, usuarioModificacion: string): Promise<CategoriaTienda> {
    const categoria = await this.obtenerCategoria(id, clienteId)
    Object.assign(categoria, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.categoriaRepo.save(categoria)
  }

  async eliminarCategoria(id: string, clienteId: string, usuarioModificacion: string): Promise<void> {
    const categoria = await this.obtenerCategoria(id, clienteId)
    categoria.estado = Status.ELIMINATE
    categoria.transaccion = Transacccion.ELIMINAR
    categoria.usuarioModificacion = usuarioModificacion
    await this.categoriaRepo.save(categoria)
  }

  async setImagenCategoria(id: string, url: string, clienteId: string, usuarioModificacion: string): Promise<CategoriaTienda> {
    const categoria = await this.obtenerCategoria(id, clienteId)
    categoria.imagenUrl = url
    categoria.transaccion = Transacccion.ACTUALIZAR
    categoria.usuarioModificacion = usuarioModificacion
    return this.categoriaRepo.save(categoria)
  }

  // ── Disponibilidad por sucursal ────────────────────────────────

  async listarDisponibilidad(articuloId: string, clienteId: string): Promise<ArticuloSucursal[]> {
    await this.obtener(articuloId, clienteId) // valida que el artículo sea de este cliente
    return this.articuloSucursalRepo.find({ where: { articuloId, estado: Status.ACTIVE } })
  }

  /** Upsert de la fila por sucursal para este artículo — se guarda todo el detalle de golpe desde el modal de edición. */
  async actualizarDisponibilidad(articuloId: string, filas: DisponibilidadSucursalDto[], clienteId: string, usuarioId: string): Promise<ArticuloSucursal[]> {
    await this.obtener(articuloId, clienteId)
    const existentes = await this.articuloSucursalRepo.find({ where: { articuloId, estado: Status.ACTIVE } })

    for (const fila of filas) {
      const existente = existentes.find(e => e.sucursalId === fila.sucursalId)
      if (existente) {
        Object.assign(existente, { activo: fila.activo, stock: fila.stock ?? null, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion: usuarioId })
        await this.articuloSucursalRepo.save(existente)
      } else {
        await this.articuloSucursalRepo.save(this.articuloSucursalRepo.create({
          articuloId, sucursalId: fila.sucursalId, activo: fila.activo, stock: fila.stock ?? null,
          estado: Status.ACTIVE, transaccion: Transacccion.CREAR, usuarioCreacion: usuarioId,
        }))
      }
    }
    return this.listarDisponibilidad(articuloId, clienteId)
  }
}
