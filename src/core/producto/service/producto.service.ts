import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
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

  async listar(
    clienteId: string,
    q?: string,
    categoria?: string,
    pagina = 1,
    limite = 25,
    soloActivos = false,
  ): Promise<{ items: Producto[]; total: number; activos: number; pagina: number; totalPaginas: number; limite: number; categorias: string[] }> {
    const qb = this.repo.createQueryBuilder('p')
      .where('p.clienteId = :clienteId', { clienteId })
      .andWhere('p.estado = :estado', { estado: Status.ACTIVE })

    if (soloActivos) qb.andWhere('p.activo = true')
    if (q) {
      qb.andWhere(
        '(p.nombre ILIKE :q OR p.marca ILIKE :q OR p.modelo ILIKE :q OR p.descripcion ILIKE :q OR p.categoria ILIKE :q)',
        { q: `%${q}%` },
      )
    }
    if (categoria) qb.andWhere('LOWER(p.categoria) = LOWER(:categoria)', { categoria })

    const total = await qb.getCount()
    const totalPaginas = Math.max(1, Math.ceil(total / limite))
    const paginaSegura = Math.min(Math.max(1, pagina), totalPaginas)

    const items = await qb.clone()
      .orderBy('p.nombre', 'ASC')
      .skip((paginaSegura - 1) * limite)
      .take(limite)
      .getMany()

    const activos = await qb.clone().andWhere('p.activo = true').getCount()

    // Categorías de todo el catálogo del cliente (para el filtro del frontend)
    const catRows = await this.repo.createQueryBuilder('p')
      .select('DISTINCT p.categoria', 'categoria')
      .where('p.clienteId = :clienteId AND p.estado = :estado AND p.categoria IS NOT NULL', {
        clienteId, estado: Status.ACTIVE,
      })
      .orderBy('categoria', 'ASC')
      .getRawMany()
    const categorias = catRows.map(r => r.categoria).filter(Boolean)

    return { items, total, activos, pagina: paginaSegura, totalPaginas, limite, categorias }
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
    const { items } = await this.listar(clienteId, termino, categoria, 1, 10, true)
    return items
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

  // ── Helpers de parseo de Excel ────────────────────────────────

  /** Extrae el valor plano de una celda (soporta hipervínculos, richText, fórmulas y fechas). */
  private valorCelda(celda: ExcelJS.Cell): string {
    const v: any = celda?.value
    if (v == null) return ''
    if (typeof v === 'object') {
      if (v.richText) return v.richText.map((r: any) => r.text).join('').trim()
      if (v.text != null) return String(v.text).trim() // hipervínculo
      if (v.result != null) return String(v.result).trim() // fórmula
      if (v instanceof Date) return v.toISOString()
      return String(v).trim()
    }
    return String(v).trim()
  }

  /** Parsea precios como "$21.613", "Bs 216.130", "21,613.50" o números nativos. */
  private parsearPrecio(valor: any): number {
    if (valor == null || valor === '') return NaN
    if (typeof valor === 'number') return valor
    // Desenvolver celdas con hipervínculo, richText o fórmula
    if (typeof valor === 'object') {
      if (typeof valor.result === 'number') return valor.result
      const texto = valor.text ?? valor.result ?? (valor.richText ? valor.richText.map((r: any) => r.text).join('') : '')
      return this.parsearPrecio(String(texto))
    }
    let s = String(valor).replace(/[^\d.,-]/g, '').trim()
    if (!s) return NaN
    if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) {
      // Formato latino: punto de miles, coma decimal → 21.613 = 21613
      s = s.replace(/\./g, '').replace(',', '.')
    } else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) {
      // Formato anglosajón: coma de miles → 21,613.50
      s = s.replace(/,/g, '')
    } else {
      s = s.replace(',', '.')
    }
    return parseFloat(s)
  }

  /** Normaliza encabezados: minúsculas, sin acentos ni espacios extras. */
  private normalizarHeader(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  async importarExcel(buffer: Buffer, clienteId: string, usuarioCreacion: string): Promise<{ creados: number; actualizados: number; errores: string[] }> {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)
    const worksheet = workbook.getWorksheet(1)

    let creados = 0
    let actualizados = 0
    const errores: string[] = []

    if (!worksheet) {
      return { creados, actualizados, errores: ['El archivo no contiene hojas de cálculo.'] }
    }

    // 1. Detectar la fila de encabezados (puede haber un título antes, como en las listas de precios)
    let filaHeaders = 0
    const mapa: Record<string, number> = {} // header normalizado → índice de columna
    const headerOriginal: Record<number, string> = {} // índice de columna → texto original del encabezado
    for (let r = 1; r <= Math.min(worksheet.rowCount, 10); r++) {
      const row = worksheet.getRow(r)
      const headers: Record<string, number> = {}
      const originales: Record<number, string> = {}
      row.eachCell((cell, col) => {
        const original = this.valorCelda(cell)
        const h = this.normalizarHeader(original)
        if (h) {
          headers[h] = col
          originales[col] = original
        }
      })
      const keys = Object.keys(headers)
      const esFilaHeader =
        (keys.includes('marca') && keys.includes('modelo')) ||
        (keys.includes('nombre') && keys.includes('precio'))
      if (esFilaHeader) {
        filaHeaders = r
        Object.assign(mapa, headers)
        Object.assign(headerOriginal, originales)
        break
      }
    }

    if (!filaHeaders) {
      return {
        creados,
        actualizados,
        errores: ['No se encontró la fila de encabezados. El archivo debe incluir las columnas "Marca" y "Modelo" (o "Nombre" y "Precio").'],
      }
    }

    // 2. Localizador de columnas por sinónimos
    const col = (...nombres: string[]): number | undefined => {
      for (const n of nombres) {
        if (mapa[n] !== undefined) return mapa[n]
        // Coincidencia parcial (ej. "en mano" dentro de "precio en mano")
        const parcial = Object.keys(mapa).find(k => k.includes(n))
        if (parcial) return mapa[parcial]
      }
      return undefined
    }

    const cols = {
      nombre: col('nombre'),
      categoria: col('categoria', 'catego'),
      marca: col('marca'),
      modelo: col('modelo'),
      version: col('version'),
      descripcion: col('descripcion'),
      potencia: col('potencia'),
      asientos: col('asientos', 'asien'),
      transmision: col('transmision'),
      traccion: col('traccion', 'tracc'),
      carroceria: col('carroceria', 'carro'),
      autonomia: col('autonomia'),
      bateria: col('bateria'),
      pantalla: col('pantalla'),
      precioUsd: col('en mano', 'precio usd', 'precio $'),
      precioBs: col('precio bs', 'bs'),
      precio: col('precio'),
      precioOferta: col('precio oferta', 'oferta'),
      moneda: col('moneda'),
      stock: col('stock'),
      activo: col('activo'),
    }

    const esFormatoVehiculos = cols.marca !== undefined && cols.modelo !== undefined && cols.nombre === undefined

    // 3. Procesar filas de datos
    const filas: Array<{ rowNumber: number; datos: any }> = []
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber <= filaHeaders) return
      try {
        const celda = (c?: number) => (c !== undefined ? this.valorCelda(row.getCell(c)) : '')

        if (esFormatoVehiculos) {
          // ── Formato lista de precios (vehículos) ──
          const marca = celda(cols.marca)
          const modelo = celda(cols.modelo)
          if (!marca && !modelo) return // fila vacía o decorativa

          const version = celda(cols.version)
          const precioUsd = this.parsearPrecio(
            cols.precioUsd !== undefined ? row.getCell(cols.precioUsd).value : celda(cols.precio),
          )
          if (!marca || !modelo || isNaN(precioUsd)) {
            errores.push(`Fila ${rowNumber}: Marca, Modelo y precio "en Mano" son obligatorios`)
            return
          }

          const precioBs = cols.precioBs !== undefined
            ? this.parsearPrecio(row.getCell(cols.precioBs).value)
            : NaN

          // Specs técnicas (columnas F–M): encabezado + contenido → descripcion
          const specs: Array<keyof typeof cols> = [
            'potencia', 'asientos', 'transmision', 'traccion',
            'carroceria', 'autonomia', 'bateria', 'pantalla',
          ]
          const partesDescripcion: string[] = []
          for (const c of specs) {
            const colIdx = cols[c]
            const val = celda(colIdx)
            if (val && colIdx !== undefined) {
              const etiqueta = headerOriginal[colIdx] || String(c)
              partesDescripcion.push(`${etiqueta}: ${val}`)
            }
          }
          const descripcion = partesDescripcion.length ? partesDescripcion.join(', ') : null

          const detalles: Record<string, any> = {}
          if (version) detalles.version = version
          if (!isNaN(precioBs)) detalles.precioBs = precioBs

          filas.push({
            rowNumber,
            datos: {
              nombre: [marca, modelo, version].filter(Boolean).join(' '),
              marca,
              modelo,
              categoria: celda(cols.categoria) || null,
              descripcion,
              precio: precioUsd,
              precioOferta: null,
              moneda: 'USD',
              stock: null,
              activo: true,
              detalles,
            },
          })
        } else {
          // ── Formato clásico (export propio): Nombre + Precio ──
          const nombre = celda(cols.nombre)
          const precio = this.parsearPrecio(cols.precio !== undefined ? row.getCell(cols.precio).value : '')
          if (!nombre && isNaN(precio)) return // fila vacía
          if (!nombre || isNaN(precio)) {
            errores.push(`Fila ${rowNumber}: Nombre y Precio son obligatorios`)
            return
          }
          const precioOferta = this.parsearPrecio(cols.precioOferta !== undefined ? row.getCell(cols.precioOferta).value : '')
          const stockVal = parseInt(celda(cols.stock), 10)
          filas.push({
            rowNumber,
            datos: {
              nombre,
              marca: celda(cols.marca) || null,
              modelo: celda(cols.modelo) || null,
              categoria: celda(cols.categoria) || null,
              descripcion: celda(cols.descripcion) || null,
              precio,
              precioOferta: isNaN(precioOferta) ? null : precioOferta,
              moneda: celda(cols.moneda) || 'PEN',
              stock: isNaN(stockVal) ? null : stockVal,
              activo: (celda(cols.activo) || 'sí').toLowerCase() !== 'no',
              detalles: {},
            },
          })
        }
      } catch (err: any) {
        errores.push(`Fila ${rowNumber}: ${err.message}`)
      }
    })

    // 4. Upsert: actualizar si ya existe (mismo nombre = marca+modelo+versión), crear si no
    for (const { rowNumber, datos } of filas) {
      try {
        const existente = await this.repo.findOne({
          where: { clienteId, nombre: datos.nombre, estado: Status.ACTIVE },
        })
        if (existente) {
          Object.assign(existente, {
            ...datos,
            detalles: { ...(existente.detalles || {}), ...datos.detalles },
            transaccion: Transacccion.ACTUALIZAR,
            usuarioModificacion: usuarioCreacion,
          })
          await this.repo.save(existente)
          actualizados++
        } else {
          await this.repo.save(this.repo.create({
            ...datos,
            clienteId,
            imagenes: [],
            estado: Status.ACTIVE,
            transaccion: Transacccion.CREAR,
            usuarioCreacion,
          }))
          creados++
        }
      } catch (err: any) {
        errores.push(`Fila ${rowNumber}: ${err.message}`)
      }
    }

    this.logger.log(`Import Excel: ${creados} creados, ${actualizados} actualizados, ${errores.length} errores`)
    return { creados, actualizados, errores }
  }
}
