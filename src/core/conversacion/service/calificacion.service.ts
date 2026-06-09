import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, IsNull, LessThan } from 'typeorm'
import { Cron, CronExpression } from '@nestjs/schedule'
import axios from 'axios'
import { Conversacion } from '../entity/conversacion.entity'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'
import { ClienteService } from '../../cliente/service/cliente.service'
import { BaseService } from '../../../common/base/base-service'
import { Status } from '../../../common/constants'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'

const DEFAULT_PROMPT = `Analiza la siguiente conversación y califica este lead del 0 al 100 según:
- Intención de compra (30 pts): menciona comprar, contratar o adquirir
- Presupuesto disponible (20 pts): indica cuánto puede invertir
- Urgencia (20 pts): necesita resolverlo pronto o tiene fecha límite
- Autoridad (15 pts): es quien toma la decisión de compra
- Perfil ideal (15 pts): coincide con el cliente objetivo

Responde ÚNICAMENTE con un JSON válido: { "score": número_entre_0_y_100, "motivo": "explicación breve en una línea" }`

export interface CalificacionConfig {
  prompt?: string
  criterios?: any[]
  umbrales?: { hot: { min: number; max: number }; warm: { min: number; max: number }; cold: { min: number; max: number } }
}

@Injectable()
export class CalificacionService extends BaseService {
  constructor(
    @InjectRepository(Conversacion)
    private readonly convRepo: Repository<Conversacion>,
    private readonly confClienteService: ConfiguracionClienteService,
    private readonly clienteService: ClienteService,
  ) {
    super(CalificacionService.name)
  }

  // ── Cron: recalifica conversaciones activas cada hora ──────────────────────
  @Cron(CronExpression.EVERY_HOUR)
  async cronCalificar(): Promise<void> {
    try {
      const clientes = await this.clienteService.listar()
      for (const cliente of clientes) {
        await this.calificarLote(cliente.id).catch(e =>
          this.logger.warn(`Cron calificacion cliente ${cliente.id}: ${e.message}`),
        )
      }
    } catch (e) {
      this.logger.error(`Cron calificacion error: ${e.message}`)
    }
  }

  // ── Calificar todas las conversaciones pendientes de un cliente ────────────
  async calificarLote(clienteId: string): Promise<{ calificadas: number; errores: number }> {
    const qb = this.convRepo.createQueryBuilder('c')
      .where('c.estado = :estado', { estado: Status.ACTIVE })
      .andWhere('c.cliente_id = :clienteId', { clienteId })
      .andWhere('c.total_mensajes > 0')
      .andWhere(
        '(c.ultima_calificacion IS NULL OR c.fecha_modificacion > c.ultima_calificacion)',
      )
      .orderBy('c.score', 'DESC')
      .take(50)

    const conversaciones = await qb.getMany()
    let calificadas = 0
    let errores = 0

    for (const conv of conversaciones) {
      try {
        await this.calificarConIA(conv.id, clienteId)
        calificadas++
      } catch {
        errores++
      }
    }
    return { calificadas, errores }
  }

  // ── Calificar una conversación con IA ──────────────────────────────────────
  async calificarConIA(conversacionId: string, clienteId: string): Promise<{ score: number; motivo: string }> {
    const conv = await this.convRepo.findOne({
      where: { id: conversacionId, clienteId, estado: Status.ACTIVE },
    })
    if (!conv) throw new Error('Conversación no encontrada')
    if (!conv.mensajes?.length) throw new Error('La conversación no tiene mensajes')

    const apiKeyConf = await this.confClienteService.obtenerPorClave(clienteId, 'ANTHROPIC_API_KEY')
    const apiKey = apiKeyConf?.valor
    if (!apiKey) throw new Error('API key de Anthropic no configurada')

    const promptConf = await this.confClienteService.obtenerPorClave(clienteId, 'CALIFICACION_PROMPT')
    const systemPrompt = promptConf?.valor || DEFAULT_PROMPT

    const mensajesTexto = conv.mensajes
      .slice(-20)
      .map(m => `${m.role === 'user' ? 'Cliente' : 'Agente'}: ${m.content}`)
      .join('\n')

    const res = await axios.post(
      ANTHROPIC_API,
      {
        model: 'claude-haiku-4-5',
        max_tokens: 256,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Conversación a calificar:\n\n${mensajesTexto}` }],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
      },
    )

    const texto = res.data?.content?.[0]?.text || '{}'
    let score = 0
    let motivo = ''
    try {
      const match = texto.match(/\{[\s\S]*\}/)
      const parsed = JSON.parse(match ? match[0] : texto)
      score = Math.min(100, Math.max(0, Number(parsed.score) || 0))
      motivo = String(parsed.motivo || '').slice(0, 500)
    } catch {
      this.logger.warn(`No se pudo parsear respuesta de calificacion: ${texto}`)
    }

    await this.convRepo.update(conv.id, {
      score,
      motivoScore: motivo,
      ultimaCalificacion: new Date(),
    })

    return { score, motivo }
  }

  // ── Configuración de calificación ─────────────────────────────────────────
  async obtenerConfig(clienteId: string): Promise<CalificacionConfig> {
    const [promptConf, criteriosConf, umbralesConf] = await Promise.all([
      this.confClienteService.obtenerPorClave(clienteId, 'CALIFICACION_PROMPT'),
      this.confClienteService.obtenerPorClave(clienteId, 'CALIFICACION_CRITERIOS'),
      this.confClienteService.obtenerPorClave(clienteId, 'CALIFICACION_UMBRALES'),
    ])
    return {
      prompt: promptConf?.valor || '',
      criterios: criteriosConf?.valor ? JSON.parse(criteriosConf.valor) : null,
      umbrales: umbralesConf?.valor ? JSON.parse(umbralesConf.valor) : null,
    }
  }

  async guardarConfig(clienteId: string, config: CalificacionConfig, userId: string): Promise<void> {
    const tareas: Promise<any>[] = []
    if (config.prompt !== undefined) {
      tareas.push(this.confClienteService.set(clienteId, {
        clave: 'CALIFICACION_PROMPT', valor: config.prompt, esSecreto: false, descripcion: 'Prompt de calificación IA',
      }, userId))
    }
    if (config.criterios !== undefined) {
      tareas.push(this.confClienteService.set(clienteId, {
        clave: 'CALIFICACION_CRITERIOS', valor: JSON.stringify(config.criterios), esSecreto: false, descripcion: 'Criterios de calificación',
      }, userId))
    }
    if (config.umbrales !== undefined) {
      tareas.push(this.confClienteService.set(clienteId, {
        clave: 'CALIFICACION_UMBRALES', valor: JSON.stringify(config.umbrales), esSecreto: false, descripcion: 'Umbrales de lead scoring',
      }, userId))
    }
    await Promise.all(tareas)
  }
}
