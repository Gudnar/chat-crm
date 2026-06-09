import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, LessThanOrEqual, Between } from 'typeorm'
import { Cron } from '@nestjs/schedule'
import axios from 'axios'
import { CampanaRemarketing } from '../entity/campana-remarketing.entity'
import { EnvioRemarketing } from '../entity/envio-remarketing.entity'
import { CreateCampanaDto } from '../dto/campana.dto'
import { Conversacion } from '../../conversacion/entity/conversacion.entity'
import { WhatsappService } from '../../whatsapp/service/whatsapp.service'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'

@Injectable()
export class RemarketingService extends BaseService {
  constructor(
    @InjectRepository(CampanaRemarketing)
    private readonly campanaRepo: Repository<CampanaRemarketing>,
    @InjectRepository(EnvioRemarketing)
    private readonly envioRepo: Repository<EnvioRemarketing>,
    @InjectRepository(Conversacion)
    private readonly convRepo: Repository<Conversacion>,
    private readonly whatsappService: WhatsappService,
    private readonly confClienteService: ConfiguracionClienteService,
  ) {
    super(RemarketingService.name)
  }

  // ── Cron: cada minuto revisa campañas programadas ─────────────────────────
  @Cron('* * * * *')
  async procesarCampanasProgramadas(): Promise<void> {
    try {
      const pendientes = await this.campanaRepo.find({
        where: {
          estadoCampana: 'pendiente',
          programadoEn: LessThanOrEqual(new Date()),
          estado: Status.ACTIVE,
        },
      })
      for (const campana of pendientes) {
        await this._ejecutar(campana).catch(e =>
          this.logger.error(`Error ejecutando campaña ${campana.id}: ${e.message}`),
        )
      }
    } catch (e) {
      this.logger.error(`Cron remarketing error: ${e.message}`)
    }
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async listarCampanas(clienteId: string): Promise<any[]> {
    const campanas = await this.campanaRepo.find({
      where: { clienteId, estado: Status.ACTIVE },
      order: { programadoEn: 'DESC' },
    })
    const result = await Promise.all(
      campanas.map(async c => ({
        ...c,
        totalContactos: await this.envioRepo.count({ where: { campanaId: c.id } }),
      })),
    )
    return result
  }

  async obtenerCampana(id: string, clienteId: string): Promise<any> {
    const campana = await this.campanaRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!campana) throw new NotFoundException('Campaña no encontrada')
    const envios = await this.envioRepo.find({
      where: { campanaId: id },
      order: { scoreAlEnvio: 'DESC' },
    })
    return { ...campana, envios }
  }

  async crearCampana(dto: CreateCampanaDto, userId: string, clienteId: string): Promise<CampanaRemarketing> {
    const campana = this.campanaRepo.create({
      ...dto,
      programadoEn: new Date(dto.programadoEn),
      scoreMin: dto.scoreMin ?? 0,
      scoreMax: dto.scoreMax ?? 100,
      canalObjetivo: dto.canalObjetivo ?? 'whatsapp',
      estadoCampana: 'pendiente',
      clienteId,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion: userId,
    })
    return this.campanaRepo.save(campana)
  }

  async cancelarCampana(id: string, userId: string, clienteId: string): Promise<void> {
    const campana = await this.campanaRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!campana) throw new NotFoundException('Campaña no encontrada')
    if (campana.estadoCampana !== 'pendiente') {
      throw new BadRequestException('Solo se pueden cancelar campañas pendientes')
    }
    campana.estadoCampana = 'cancelado'
    campana.transaccion = Transacccion.ACTUALIZAR
    campana.usuarioModificacion = userId
    await this.campanaRepo.save(campana)
  }

  async eliminarCampana(id: string, userId: string, clienteId: string): Promise<void> {
    const campana = await this.campanaRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!campana) throw new NotFoundException('Campaña no encontrada')
    if (campana.estadoCampana === 'ejecutando') {
      throw new BadRequestException('No se puede eliminar una campaña en ejecución')
    }
    campana.estado = Status.ELIMINATE
    campana.transaccion = Transacccion.ELIMINAR
    campana.usuarioModificacion = userId
    await this.campanaRepo.save(campana)
  }

  async ejecutarCampanaAhora(id: string, clienteId: string): Promise<void> {
    const campana = await this.campanaRepo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!campana) throw new NotFoundException('Campaña no encontrada')
    if (!['pendiente', 'cancelado'].includes(campana.estadoCampana)) {
      throw new BadRequestException('La campaña ya fue ejecutada o está en ejecución')
    }
    campana.estadoCampana = 'pendiente'
    await this.campanaRepo.save(campana)
    await this._ejecutar(campana)
  }

  // ── Ejecución ─────────────────────────────────────────────────────────────

  private async _ejecutar(campana: CampanaRemarketing): Promise<void> {
    // Guard: marcar como ejecutando para evitar doble ejecución
    await this.campanaRepo.update(campana.id, { estadoCampana: 'ejecutando' })

    try {
      const waConfig = await this.whatsappService.obtenerConfig(campana.clienteId)
      if (!waConfig.accessToken || !waConfig.phoneNumberId) {
        throw new Error('WhatsApp no configurado para este cliente')
      }

      const conversaciones = await this.convRepo
        .createQueryBuilder('c')
        .where('c.estado = :estado', { estado: Status.ACTIVE })
        .andWhere('c.cliente_id = :clienteId', { clienteId: campana.clienteId })
        .andWhere('c.total_mensajes > 0')
        .andWhere('c.score >= :scoreMin', { scoreMin: campana.scoreMin })
        .andWhere('c.score <= :scoreMax', { scoreMax: campana.scoreMax })
        .andWhere('c.canal = :canal', { canal: campana.canalObjetivo })
        .orderBy('c.score', 'DESC')
        .getMany()

      // Deduplicar: un contacto → conv con mayor score
      const contactoMap = new Map<string, Conversacion>()
      for (const conv of conversaciones) {
        if (!contactoMap.has(conv.contacto) || conv.score > contactoMap.get(conv.contacto)!.score) {
          contactoMap.set(conv.contacto, conv)
        }
      }
      const targets = Array.from(contactoMap.values()).sort((a, b) => b.score - a.score)

      let apiKey: string | undefined
      if (campana.tipoMensaje === 'ia') {
        const keyConf = await this.confClienteService.obtenerPorClave(campana.clienteId, 'ANTHROPIC_API_KEY')
        apiKey = keyConf?.valor
      }

      let totalEnviados = 0
      let totalErrores = 0

      for (const conv of targets) {
        const envio = this.envioRepo.create({
          campanaId: campana.id,
          conversacionId: conv.id,
          contacto: conv.contacto,
          scoreAlEnvio: conv.score,
          estadoEnvio: 'pendiente',
          clienteId: campana.clienteId,
          estado: Status.ACTIVE,
          transaccion: Transacccion.CREAR,
          usuarioCreacion: campana.usuarioCreacion,
        })
        const envioGuardado = await this.envioRepo.save(envio)

        try {
          let mensajeFinal: string

          if (campana.tipoMensaje === 'ia' && apiKey) {
            mensajeFinal = await this._generarMensajeIA(conv, campana.mensaje, apiKey)
          } else {
            mensajeFinal = campana.mensaje.replace(/\{contacto\}/gi, conv.contacto)
          }

          await this.whatsappService.enviarTexto(conv.contacto, mensajeFinal, waConfig)

          await this.envioRepo.update(envioGuardado.id, {
            estadoEnvio: 'enviado',
            mensajeEnviado: mensajeFinal,
            enviadoEn: new Date(),
          })
          totalEnviados++
        } catch (err) {
          await this.envioRepo.update(envioGuardado.id, {
            estadoEnvio: 'error',
            error: err.message?.slice(0, 500),
          })
          totalErrores++
        }
      }

      await this.campanaRepo.update(campana.id, {
        estadoCampana: 'completado',
        ejecutadoEn: new Date(),
        totalEnviados,
        totalErrores,
      })
    } catch (err) {
      this.logger.error(`Error en ejecución campaña ${campana.id}: ${err.message}`)
      await this.campanaRepo.update(campana.id, {
        estadoCampana: 'cancelado',
        totalErrores: 1,
      })
      throw err
    }
  }

  private async _generarMensajeIA(conv: Conversacion, objetivo: string, apiKey: string): Promise<string> {
    const historial = conv.mensajes
      .slice(-10)
      .map(m => `${m.role === 'user' ? 'Cliente' : 'Agente'}: ${m.content}`)
      .join('\n')

    const systemPrompt = `Eres un experto en marketing conversacional.
Basándote en el historial de conversación, redacta un mensaje de remarketing corto,
personalizado y persuasivo para este lead. El objetivo de la campaña es: "${objetivo}".
Responde ÚNICAMENTE con el texto del mensaje, sin comillas ni explicaciones.`

    const res = await axios.post(
      ANTHROPIC_API,
      {
        model: 'claude-haiku-4-5',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Historial:\n${historial}\n\nContacto: ${conv.contacto}` }],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
      },
    )
    return res.data?.content?.[0]?.text?.trim() || objetivo
  }
}
