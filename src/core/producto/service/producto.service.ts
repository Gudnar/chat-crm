import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'
import { existsSync, unlinkSync } from 'fs'
import { join } from 'path'
import { ConfigService } from '@nestjs/config'
import * as ExcelJS from 'exceljs'
import { Producto } from '../entity/producto.entity'
import { CreateProductoDto, UpdateProductoDto } from '../dto/create-producto.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'

@Injectable()
export class ProductoService extends BaseService {
  constructor(
    @InjectRepository(Producto)
    private readonly repo: Repository<Producto>,
    private readonly configService: ConfigService,
  ) {
    super(ProductoService.name)
  }

  // ── URL helpers ───────────────────────────────────────────────

  construirUrlImagen(filename: string): string {
    const appUrl = (this.configService.get<string>('APP_URL') || 'http://localhost:3001').replace(/\/$/, '')
    return `${appUrl}/uploads/${filename}`
  }

  resolverUrlsImagenes(filenames: string[]): string[] {
    return (filenames || []).map(f => this.construirUrlImagen(f))
  }

  // ── CRUD ──────────────────────────────────────────────────────

  async listar(clienteId: string, q?: string, categoria?: string): Promise<Producto[]> {
    const base = { clienteId, estado: Status.ACTIVE, activo: true }
    const where: any[] = q
      ? [
          { ...base, nombre: ILike(`%${q}%`) },
          { ...base, marca: ILike(`%${q}%`) },
          { ...base, modelo: ILike(`%${q}%`) },
          { ...base, descripcion: ILike(`%${q}%`) },
          { ...base, categoria: ILike(`%${q}%`) },
        ]
      : [base]

    const items = await this.repo.find({ where, order: { nombre: 'ASC' }, take: 50 })
    return categoria
      ? items.filter(p => p.categoria?.toLowerCase() === categoria.toLowerCase())
      : items
  }

  async obtener(id: string, clienteId: string): Promise<Producto> {
    const p = await this.repo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!p) throw new NotFoundException('Producto no encontrado')
    return p
  }

  async crear(dto: CreateProductoDto, clienteId: string, usuarioCreacion: string): Promise<Producto> {
    const producto = this.repo.create({
      ...dto,
      clienteId,
      moneda: dto.moneda || 'PEN',
      imagenes: [],
      detalles: dto.detalles || {},
      activo: true,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.repo.save(producto)
  }

  async actualizar(id: string, dto: UpdateProductoDto, clienteId: string, usuarioModificacion: string): Promise<Producto> {
    const p = await this.obtener(id, clienteId)
    const { imagenes: _, ...rest } = dto as any
    Object.assign(p, { ...rest, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(p)
  }

  async eliminar(id: string, clienteId: string, usuarioModificacion: string): Promise<void> {
    const p = await this.obtener(id, clienteId)
    // Eliminar archivos físicos
    for (const filename of p.imagenes || []) {
      this.borrarArchivo(filename)
    }
    p.estado = Status.ELIMINATE
    p.transaccion = Transacccion.ELIMINAR
    p.usuarioModificacion = usuarioModificacion
    await this.repo.save(p)
  }

  // ── Gestión de imágenes ───────────────────────────────────────

  async agregarImagenes(id: string, filenames: string[], clienteId: string, usuarioModificacion: string): Promise<Producto> {
    const p = await this.obtener(id, clienteId)
    p.imagenes = [...(p.imagenes || []), ...filenames]
    p.transaccion = Transacccion.ACTUALIZAR
    p.usuarioModificacion = usuarioModificacion
    return this.repo.save(p)
  }

  async eliminarImagen(id: string, filename: string, clienteId: string, usuarioModificacion: string): Promise<Producto> {
    const p = await this.obtener(id, clienteId)
    this.borrarArchivo(filename)
    p.imagenes = (p.imagenes || []).filter(img => img !== filename)
    p.transaccion = Transacccion.ACTUALIZAR
    p.usuarioModificacion = usuarioModificacion
    return this.repo.save(p)
  }

  private borrarArchivo(filename: string): void {
    try {
      const filePath = join(process.cwd(), 'uploads', filename)
      if (existsSync(filePath)) unlinkSync(filePath)
    } catch (err: any) {
      this.logger.warn(`No se pudo eliminar el archivo ${filename}: ${err.message}`)
    }
  }

  // ── Búsqueda para herramienta Claude ─────────────────────────

  async buscar(clienteId: string, termino: string, categoria?: string): Promise<Producto[]> {
    return this.listar(clienteId, termino, categoria)
  }

  formatearParaClaude(productos: Producto[]): string {
    if (!productos.length) {
      return 'No encontré productos para ese término de búsqueda en el catálogo.'
    }

    return productos.map(p => {
      const precio = p.precioOferta
        ? `${p.moneda} ${Number(p.precioOferta).toFixed(2)} (oferta, antes ${p.moneda} ${Number(p.precio).toFixed(2)})`
        : `${p.moneda} ${Number(p.precio).toFixed(2)}`

      const lineas = [`• *${p.nombre}*`]
      if (p.marca) lineas.push(`  Marca: ${p.marca}`)
      if (p.modelo) lineas.push(`  Modelo: ${p.modelo}`)
      if (p.categoria) lineas.push(`  Categoría: ${p.categoria}`)
      lineas.push(`  Precio: ${precio}`)
      if (p.stock != null) lineas.push(`  Disponibilidad: ${p.stock > 0 ? `${p.stock} en stock` : 'Sin stock'}`)
      if (p.descripcion) lineas.push(`  ${p.descripcion}`)
      if (Object.keys(p.detalles || {}).length) {
        const extras = Object.entries(p.detalles).map(([k, v]) => `${k}: ${v}`).join(', ')
        lineas.push(`  Detalles: ${extras}`)
      }
      return lineas.join('\n')
    }).join('\n\n')
  }

  // ── Importar/Exportar Excel ───────────────────────────────────

  async exportarExcel(clienteId: string): Promise<Buffer> {
    const productos = await this.repo.find({
      where: { clienteId, estado: Status.ACTIVE },
      order: { nombre: 'ASC' },
    })

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Productos')

    worksheet.columns = [
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Marca', key: 'marca', width: 15 },
      { header: 'Modelo', key: 'modelo', width: 15 },
      { header: 'Categoría', key: 'categoria', width: 15 },
      { header: 'Descripción', key: 'descripcion', width: 40 },
      { header: 'Precio', key: 'precio', width: 12 },
      { header: 'Precio Oferta', key: 'precioOferta', width: 15 },
      { header: 'Moneda', key: 'moneda', width: 10 },
      { header: 'Stock', key: 'stock', width: 10 },
      { header: 'Activo', key: 'activo', width: 10 },
    ]

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } }

    productos.forEach(p => {
      worksheet.addRow({
        nombre: p.nombre,
        marca: p.marca || '',
        modelo: p.modelo || '',
        categoria: p.categoria || '',
        descripcion: p.descripcion || '',
        precio: p.precio,
        precioOferta: p.precioOferta || '',
        moneda: p.moneda || 'PEN',
        stock: p.stock ?? '',
        activo: p.activo ? 'Sí' : 'No',
      })
    })

    return await workbook.xlsx.writeBuffer() as Buffer
  }

  async importarExcel(buffer: Buffer, clienteId: string, usuarioCreacion: string): Promise<{ creados: number; errores: string[] }> {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)
    const worksheet = workbook.getWorksheet(1)

    let creados = 0
    const errores: string[] = []
    const productosACrear: any[] = []

    worksheet?.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return // Skip header

      try {
        const values = row.values as any[]
        const nombre = values[1]
        const marca = values[2]
        const modelo = values[3]
        const categoria = values[4]
        const descripcion = values[5]
        const precio = parseFloat(values[6])
        const precioOferta = values[7] ? parseFloat(values[7]) : null
        const moneda = values[8] || 'PEN'
        const stock = values[9] ? parseInt(values[9], 10) : null
        const activo = (values[10] || 'Sí').toLowerCase() === 'sí'

        if (!nombre || isNaN(precio)) {
          errores.push(`Fila ${rowNumber}: Nombre y Precio son obligatorios`)
          return
        }

        productosACrear.push({
          nombre,
          marca: marca || null,
          modelo: modelo || null,
          categoria: categoria || null,
          descripcion: descripcion || null,
          precio,
          precioOferta: precioOferta || null,
          moneda,
          stock: stock || null,
          activo,
          clienteId,
          imagenes: [],
          detalles: {},
          estado: Status.ACTIVE,
          transaccion: Transacccion.CREAR,
          usuarioCreacion,
        } as any)
      } catch (err: any) {
        errores.push(`Fila ${rowNumber}: ${err.message}`)
      }
    })

    // Insertar todos los productos
    if (productosACrear.length > 0) {
      try {
        await this.repo.insert(productosACrear)
        creados = productosACrear.length
      } catch (err: any) {
        errores.push(`Error al insertar productos: ${err.message}`)
      }
    }

    return { creados, errores }
  }
}
