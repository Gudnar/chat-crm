import { Injectable, Logger } from '@nestjs/common'
import { ConversacionService } from '../../conversacion/service/conversacion.service'
import { ProductoService } from '../../producto/service/producto.service'

export interface ToolContexto {
  conversacionId: string
  clienteId: string
  agenteId: string
}

export interface ToolResult {
  texto: string
  imagenes?: string[]
}

@Injectable()
export class ToolExecutorService {
  private readonly logger = new Logger(ToolExecutorService.name)

  constructor(
    private readonly conversacionService: ConversacionService,
    private readonly productoService: ProductoService,
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
    const texto = this.productoService.formatearParaClaude(productos)

    // Convertir nombres de archivo a URLs públicas (máx 3 imágenes en total)
    const imagenes = productos
      .flatMap(p => this.productoService.resolverUrlsImagenes(p.imagenes || []))
      .slice(0, 3)

    return { texto, imagenes }
  }
}
