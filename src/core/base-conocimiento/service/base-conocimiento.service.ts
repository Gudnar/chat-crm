import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as ExcelJS from 'exceljs'
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

  // ── Importar / Exportar Excel ─────────────────────────────────

  /** Extrae el valor plano de una celda (soporta hipervínculos, richText y fórmulas). */
  private valorCelda(celda: ExcelJS.Cell): string {
    const v: any = celda?.value
    if (v == null) return ''
    if (typeof v === 'object') {
      if (v.richText) return v.richText.map((r: any) => r.text).join('').trim()
      if (v.text != null) return String(v.text).trim()
      if (v.result != null) return String(v.result).trim()
      return String(v).trim()
    }
    return String(v).trim()
  }

  private normalizarHeader(texto: string): string {
    return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim()
  }

  async exportarExcel(agenteId: string): Promise<Buffer> {
    const faqs = await this.listarPorAgente(agenteId)

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Base de Conocimiento')

    worksheet.columns = [
      { header: 'Pregunta', key: 'pregunta', width: 50 },
      { header: 'Respuesta', key: 'respuesta', width: 80 },
      { header: 'Categoría', key: 'categoria', width: 25 },
      { header: 'Activo', key: 'activo', width: 10 },
      { header: 'Orden', key: 'orden', width: 8 },
    ]
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } }
    // Respuestas largas: ajustar texto
    worksheet.getColumn('respuesta').alignment = { wrapText: true, vertical: 'top' }
    worksheet.getColumn('pregunta').alignment = { wrapText: true, vertical: 'top' }

    for (const f of faqs) {
      worksheet.addRow({
        pregunta: f.pregunta,
        respuesta: f.respuesta,
        categoria: f.categoria || '',
        activo: f.activo ? 'Sí' : 'No',
        orden: f.orden ?? 0,
      })
    }

    return await workbook.xlsx.writeBuffer() as Buffer
  }

  async importarExcel(
    buffer: Buffer,
    agenteId: string,
    usuarioCreacion: string,
  ): Promise<{ creadas: number; actualizadas: number; errores: string[] }> {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)
    const worksheet = workbook.getWorksheet(1)

    let creadas = 0
    let actualizadas = 0
    const errores: string[] = []
    if (!worksheet) return { creadas, actualizadas, errores: ['El archivo no contiene hojas de cálculo.'] }

    // Detectar la fila de encabezados (tolera títulos previos)
    let filaHeaders = 0
    const mapa: Record<string, number> = {}
    for (let r = 1; r <= Math.min(worksheet.rowCount, 10); r++) {
      const headers: Record<string, number> = {}
      worksheet.getRow(r).eachCell((cell, col) => {
        const h = this.normalizarHeader(this.valorCelda(cell))
        if (h) headers[h] = col
      })
      if (headers['pregunta'] !== undefined && headers['respuesta'] !== undefined) {
        filaHeaders = r
        Object.assign(mapa, headers)
        break
      }
    }
    if (!filaHeaders) {
      return { creadas, actualizadas, errores: ['No se encontró la fila de encabezados. El archivo debe tener las columnas "Pregunta" y "Respuesta".'] }
    }

    const col = (nombre: string) => mapa[nombre]
    const filas: Array<{ rowNumber: number; datos: any }> = []

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber <= filaHeaders) return
      try {
        const celda = (c?: number) => (c !== undefined ? this.valorCelda(row.getCell(c)) : '')
        const pregunta = celda(col('pregunta'))
        const respuesta = celda(col('respuesta'))
        if (!pregunta && !respuesta) return // fila vacía
        if (!pregunta || !respuesta) {
          errores.push(`Fila ${rowNumber}: Pregunta y Respuesta son obligatorias`)
          return
        }
        const activoTxt = celda(col('activo')).toLowerCase()
        const ordenNum = parseInt(celda(col('orden')), 10)
        filas.push({
          rowNumber,
          datos: {
            pregunta,
            respuesta,
            categoria: celda(col('categoria')) || null,
            // Por seguridad, respuestas con [CONFIRMAR] pendiente quedan inactivas
            activo: respuesta.includes('[CONFIRMAR')
              ? false
              : (activoTxt ? activoTxt !== 'no' && activoTxt !== 'false' && activoTxt !== '0' : true),
            orden: isNaN(ordenNum) ? 0 : ordenNum,
          },
        })
      } catch (err: any) {
        errores.push(`Fila ${rowNumber}: ${err.message}`)
      }
    })

    // Upsert por pregunta dentro del agente
    for (const { rowNumber, datos } of filas) {
      try {
        const existente = await this.repo.findOne({
          where: { agenteId, pregunta: datos.pregunta, estado: Status.ACTIVE },
        })
        if (existente) {
          Object.assign(existente, { ...datos, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion: usuarioCreacion })
          await this.repo.save(existente)
          actualizadas++
        } else {
          await this.repo.save(this.repo.create({
            ...datos,
            agenteId,
            estado: Status.ACTIVE,
            transaccion: Transacccion.CREAR,
            usuarioCreacion,
          }))
          creadas++
        }
      } catch (err: any) {
        errores.push(`Fila ${rowNumber}: ${err.message}`)
      }
    }

    this.logger.log(`Import FAQ agente ${agenteId}: ${creadas} creadas, ${actualizadas} actualizadas, ${errores.length} errores`)
    return { creadas, actualizadas, errores }
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
