import { Injectable, Logger } from '@nestjs/common'
import { extname } from 'path'
import { ConversacionService } from '../../conversacion/service/conversacion.service'
import { ProductoService } from '../../producto/service/producto.service'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'
import { RecursoService } from '../../recurso/service/recurso.service'
import { Recurso, TipoRecurso } from '../../recurso/entity/recurso.entity'

export interface ToolContexto {
  conversacionId: string
  clienteId: string
  agenteId: string
}

export interface ToolDocumento {
  url: string
  filename: string
}

export interface ToolResult {
  texto: string
  imagenes?: string[]
  documentos?: ToolDocumento[]
  audios?: string[]
  videos?: string[]
}

@Injectable()
export class ToolExecutorService {
  private readonly logger = new Logger(ToolExecutorService.name)

  constructor(
    private readonly conversacionService: ConversacionService,
    private readonly productoService: ProductoService,
    private readonly confClienteService: ConfiguracionClienteService,
    private readonly recursoService: RecursoService,
  ) {}

  async ejecutar(nombre: string, input: Record<string, any>, contexto: ToolContexto): Promise<ToolResult> {
    this.logger.log(`[Tool] ${nombre} → ${JSON.stringify(input)}`)

    try {
      switch (nombre) {
        case 'calificar_lead':   return await this.calificarLead(input, contexto)
        case 'cambiar_estado':   return await this.cambiarEstado(input, contexto)
        case 'escalar_agente':   return await this.escalarAgente(input, contexto)
        case 'crear_nota':       return await this.crearNota(input, contexto)
        case 'buscar_producto':  return await this.buscarProducto(input, contexto)
        case 'enviar_catalogo':  return await this.enviarCatalogo(input, contexto)
        case 'enviar_recurso':   return await this.enviarRecurso(input, contexto)
        default:
          this.logger.warn(`[Tool] Herramienta desconocida: ${nombre}`)
          return { texto: `Herramienta "${nombre}" no está implementada.` }
      }
    } catch (err: any) {
      this.logger.error(`[Tool] Error ejecutando ${nombre}: ${err.message}`)
      return { texto: `Error al ejecutar la herramienta: ${err.message}` }
    }
  }

  private async calificarLead(input: any, ctx: ToolContexto): Promise<ToolResult> {
    const score = Math.min(100, Math.max(0, Number(input.score) || 0))
    await this.conversacionService.actualizarScore(ctx.conversacionId, score)
    return { texto: `Lead calificado con score ${score}. Razón: ${input.razon ?? 'sin especificar'}` }
  }

  private async cambiarEstado(input: any, ctx: ToolContexto): Promise<ToolResult> {
    await this.conversacionService.actualizarEstado(ctx.conversacionId, input.estado)
    return { texto: `Estado de conversación actualizado a: ${input.estado}` }
  }

  private async escalarAgente(input: any, ctx: ToolContexto): Promise<ToolResult> {
    await this.conversacionService.escalar(ctx.conversacionId, input.razon)
    return { texto: `Conversación escalada a agente humano. Razón: ${input.razon}. Prioridad: ${input.prioridad ?? 'media'}` }
  }

  private async crearNota(input: any, ctx: ToolContexto): Promise<ToolResult> {
    await this.conversacionService.agregarNota(ctx.conversacionId, input.nota)
    return { texto: `Nota interna creada: ${input.nota}` }
  }

  private async buscarProducto(input: any, ctx: ToolContexto): Promise<ToolResult> {
    const productos = await this.productoService.buscar(ctx.clienteId, input.termino, input.categoria)
    let texto = this.productoService.formatearParaClaude(productos)

    // Convertir nombres de archivo a URLs públicas (máx 3 imágenes en total)
    const imagenes = productos
      .flatMap(p => this.productoService.resolverUrlsImagenes(p.imagenes || []))
      .slice(0, 3)

    // Informar al modelo si se adjuntaron fotos, para que no afirme envíos que no ocurrieron
    if (productos.length > 0) {
      texto += imagenes.length
        ? `\n\n[Sistema: se adjuntaron ${imagenes.length} imagen(es) del producto al chat del cliente]`
        : '\n\n[Sistema: estos productos NO tienen imágenes cargadas — no se envió ninguna foto al cliente]'
    }

    return { texto, imagenes }
  }

  /**
   * Envía el catálogo PDF del cliente. La URL se guarda completa (absoluta) en
   * `configuracion_cliente.CATALOGO_PDF_URL`, así no depende de APP_URL y el
   * archivo puede estar hospedado en cualquier lugar público.
   */
  private async enviarCatalogo(_input: any, ctx: ToolContexto): Promise<ToolResult> {
    const urlCfg = await this.confClienteService.obtenerPorClave(ctx.clienteId, 'CATALOGO_PDF_URL')
    const url = urlCfg?.valor?.trim()

    if (!url) {
      this.logger.warn(`[Tool] enviar_catalogo: cliente ${ctx.clienteId} no tiene CATALOGO_PDF_URL configurado`)
      return {
        texto: '[Sistema: NO hay catálogo PDF configurado y no se envió ningún archivo. Dilo con honestidad, nunca afirmes haberlo enviado. Ofrece mostrar opciones del catálogo o derivar a un asesor.]',
      }
    }

    const nombreCfg = await this.confClienteService.obtenerPorClave(ctx.clienteId, 'CATALOGO_PDF_NOMBRE')
    const filename = nombreCfg?.valor?.trim() || 'catalogo.pdf'

    return {
      texto: '[Sistema: el catálogo PDF fue adjuntado y enviado al cliente. Coméntalo con naturalidad en una línea y sigue la conversación.]',
      documentos: [{ url, filename }],
    }
  }

  /**
   * Busca en la tabla `recurso` (catálogos, fichas, fotos, audios, videos subidos desde
   * la vista Recursos) y envía el que coincida. Si hay más de un match, no se envía nada
   * automáticamente para no arriesgar mandar el archivo equivocado.
   */
  private async enviarRecurso(input: any, ctx: ToolContexto): Promise<ToolResult> {
    const termino = String(input?.termino || '').trim()
    this.logger.log(`[enviarRecurso] START: termino="${termino}", clienteId=${ctx.clienteId}, agenteId=${ctx.agenteId}`)

    if (!termino) {
      return { texto: '[Sistema: falta el término de búsqueda para enviar_recurso. No se envió nada.]' }
    }

    try {
      this.logger.log(`[enviarRecurso] recursoService exists: ${!!this.recursoService}`)
      const encontrados = await this.recursoService.buscarPorKeywords(ctx.clienteId, termino)
      this.logger.log(`[enviarRecurso] buscarPorKeywords devolvió ${encontrados.length} resultado(s)`)

      // Un recurso con agenteId asignado solo lo puede enviar ESE agente; sin agenteId es compartido.
      const visibles = encontrados.filter(r => !r.agenteId || r.agenteId === ctx.agenteId)
      this.logger.log(`[enviarRecurso] después de filtrar por agente: ${visibles.length} visible(s)`)

      if (visibles.length === 0) {
        this.logger.warn(`[Tool] enviar_recurso: sin resultados para "${termino}" (cliente ${ctx.clienteId})`)
        return {
          texto: `[Sistema: no se encontró ningún recurso para "${termino}". No hay archivo, no afirmes haberlo enviado. Pregunta al cliente qué necesita o intenta con otro término.]`,
        }
      }

      if (visibles.length > 1) {
        const nombres = visibles.slice(0, 5).map(r => `${r.nombre} (${r.tipo.toLowerCase()})`).join(', ')
        this.logger.log(`[enviarRecurso] múltiples resultados, no se envía nada automáticamente`)
        return {
          texto: `[Sistema: hay ${visibles.length} recursos que coinciden con "${termino}": ${nombres}. No se envió ninguno para evitar confusión. Pide al cliente que precise cuál necesita, o vuelve a llamar la herramienta con un término más específico.]`,
        }
      }

      const recurso = visibles[0]
      this.logger.log(`[enviarRecurso] recurso encontrado: id=${recurso.id}, nombre="${recurso.nombre}", tipo=${recurso.tipo}, archivoLocal="${recurso.archivoLocal}"`)

      const url = await this.recursoService.obtenerUrlPublica(recurso.id, ctx.clienteId)
      this.logger.log(`[enviarRecurso] obtenerUrlPublica devolvió: ${url}`)

      const filename = this.nombreArchivo(recurso)
      this.logger.log(`[enviarRecurso] nombreArchivo: ${filename}`)

      const confirmacion = `[Sistema: se adjuntó "${recurso.nombre}" (${recurso.tipo.toLowerCase()}) al chat del cliente. Coméntalo con naturalidad en una línea y sigue la conversación.]`

      switch (recurso.tipo) {
        case TipoRecurso.PDF:
          this.logger.log(`[enviarRecurso] enviando como PDF: ${url}`)
          return { texto: confirmacion, documentos: [{ url, filename }] }
        case TipoRecurso.IMAGEN:
          this.logger.log(`[enviarRecurso] enviando como IMAGEN: ${url}`)
          return { texto: confirmacion, imagenes: [url] }
        case TipoRecurso.AUDIO:
          this.logger.log(`[enviarRecurso] enviando como AUDIO: ${url}`)
          return { texto: confirmacion, audios: [url] }
        case TipoRecurso.VIDEO:
          this.logger.log(`[enviarRecurso] enviando como VIDEO: ${url}`)
          return { texto: confirmacion, videos: [url] }
        default:
          this.logger.warn(`[enviarRecurso] tipo no soportado: ${recurso.tipo}`)
          return { texto: `[Sistema: el recurso "${recurso.nombre}" tiene un tipo no soportado para envío automático.]` }
      }
    } catch (err: any) {
      this.logger.error(`[enviarRecurso] ERROR: ${err.message}`, err.stack)
      return { texto: `[Sistema: error interno al buscar recurso: ${err.message}]` }
    }
  }

  /** Nombre legible para el cliente en WhatsApp: nombre del recurso + extensión real del archivo. */
  private nombreArchivo(recurso: Recurso): string {
    let ext = ''
    if (recurso.archivoLocal) {
      ext = extname(recurso.archivoLocal)
    } else if (recurso.urlExterna) {
      try { ext = extname(new URL(recurso.urlExterna).pathname) } catch { /* URL inválida, sin extensión */ }
    }
    const base = recurso.nombre.replace(/[\\/:*?"<>|]/g, '').trim() || 'archivo'
    return ext ? `${base}${ext}` : base
  }
}
