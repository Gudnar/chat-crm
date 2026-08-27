import { BadRequestException, Body, Controller, Get, Post, Query, Res, UseGuards, UseInterceptors, UploadedFile, Request, HttpCode, Logger } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { WhatsappService } from '../service/whatsapp.service'
import { WhatsappWebhookService } from '../service/whatsapp-webhook.service'
import { RedSocialWebhookService } from '../../red-social/service/red-social-webhook.service'
import { RedSocialService } from '../../red-social/service/red-social.service'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'
import { PlantillaWhatsappService } from '../service/plantilla-whatsapp.service'
import { WhatsappConfigDto, EnviarMensajeDto, EnviarAdjuntoDto, TestConexionDto, WaWebhookMessage, WaContact } from '../dto/whatsapp.dto'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'
import { baseUrlAssets } from '../../../common/lib/url-assets.util'

const adjuntosStorage = diskStorage({
  destination: join(process.cwd(), 'uploads', 'conversaciones'),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${extname(file.originalname).toLowerCase()}`)
  },
})

@Controller('whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name)

  constructor(
    private readonly waService: WhatsappService,
    private readonly webhookService: WhatsappWebhookService,
    private readonly redSocialWebhookService: RedSocialWebhookService,
    private readonly redSocialService: RedSocialService,
    private readonly confClienteService: ConfiguracionClienteService,
    private readonly plantillaService: PlantillaWhatsappService,
  ) {}

  // ── Webhook verification (GET) — WA + FB/IG ──────────────────

  @Get('webhook')
  async verificarWebhook(@Query() query: any, @Res() res: Response): Promise<void> {
    const mode      = query['hub.mode']
    const token     = query['hub.verify_token']
    const challenge = query['hub.challenge']

    if (mode !== 'subscribe') { res.sendStatus(403); return }

    // Intentar verificar como token de WhatsApp (configuracion_cliente)
    const clienteId = await this.confClienteService.resolverClientePorVerifyToken(token)
    if (clienteId) {
      this.logger.log(`[WA] Webhook verificado para cliente ${clienteId}`)
      res.status(200).send(challenge)
      return
    }

    // Intentar verificar como token de red social (red_social_cuenta)
    const cuenta = await this.redSocialService.resolverCuentaPorVerifyToken(token)
    if (cuenta) {
      this.logger.log(`[FB/IG] Webhook verificado para cuenta ${cuenta.id} (${cuenta.plataforma})`)
      res.status(200).send(challenge)
      return
    }

    this.logger.warn(`[Webhook] Verificación fallida — token: ${token}`)
    res.sendStatus(403)
  }

  // ── Webhook receiver (POST) — WA + FB/IG ─────────────────────

  @Post('webhook')
  @HttpCode(200)
  async recibirWebhook(@Body() body: any): Promise<string> {
    const obj = body.object

    // WhatsApp
    if (obj === 'whatsapp_business_account') {
      try {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            const value = change.value
            if (!value) continue

            // Estado de plantilla (aprobada/rechazada/pausada) — no trae phone_number_id, se identifica por el WABA (entry.id)
            if (change.field === 'message_template_status_update') {
              this.procesarActualizacionPlantilla(entry.id, value)
                .catch(err => this.logger.error(`[WA] Error async procesando estado de plantilla: ${err.message}`))
              continue
            }

            const phoneNumberId: string = value.metadata?.phone_number_id || ''
            const contacts: WaContact[] = value.contacts || []
            for (const rawMessage of (value.messages || []) as WaWebhookMessage[]) {
              const contact = contacts.find(c => c.wa_id === rawMessage.from)
              const displayName = contact?.profile?.name || rawMessage.from
              this.webhookService.procesarMensajeEntrante(rawMessage, displayName, phoneNumberId)
                .catch(err => this.logger.error(`[WA] Error async: ${err.message}`))
            }
          }
        }
      } catch (err: any) {
        this.logger.error(`[WA] Error procesando webhook: ${err.message}`)
      }
      return 'EVENT_RECEIVED'
    }

    // Facebook / Instagram
    if (obj === 'page' || obj === 'instagram') {
      try {
        for (const entry of body.entry || []) {
          if (obj === 'instagram') {
            this.redSocialWebhookService.procesarEventoInstagram(entry)
              .catch(e => this.logger.error(`[IG] async error: ${e.message}`))
          } else {
            this.redSocialWebhookService.procesarEventoFacebook(entry)
              .catch(e => this.logger.error(`[FB] async error: ${e.message}`))
          }
        }
      } catch (err: any) {
        this.logger.error(`[FB/IG] Error procesando webhook: ${err.message}`)
      }
      return 'EVENT_RECEIVED'
    }

    return 'EVENT_RECEIVED'
  }

  /** value: {event, message_template_id, message_template_name, message_template_language, reason} — payload documentado por Meta para message_template_status_update. */
  private async procesarActualizacionPlantilla(wabaId: string, value: any): Promise<void> {
    const clienteId = await this.confClienteService.resolverClientePorWabaId(wabaId)
    if (!clienteId) {
      this.logger.warn(`[WA] Webhook de plantilla ignorado: no hay cliente configurado con WABA_ID=${wabaId}`)
      return
    }
    const metaTemplateId: string = String(value.message_template_id || '')
    if (!metaTemplateId) return
    await this.plantillaService.actualizarEstadoPorWebhook(clienteId, metaTemplateId, value.event, value.reason)
  }

  // ── Authenticated endpoints ───────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('config')
  async obtenerConfig(@Request() req: any) {
    const config = await this.waService.obtenerConfig(this.clienteIdDe(req))
    return {
      ...config,
      accessToken: config.accessToken ? '••••••••••••••••' : '',
      _hasAccessToken: !!config.accessToken // Flag para saber si hay token guardado
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('config')
  async guardarConfig(@Body() dto: WhatsappConfigDto, @Request() req: any) {
    await this.waService.guardarConfig(this.clienteIdDe(req), dto, req.user.id)
    return new SuccessResponseDto(null, 'Configuración WhatsApp guardada correctamente')
  }

  @UseGuards(JwtAuthGuard)
  @Post('test-connection')
  async testConexion(@Body() dto: TestConexionDto, @Request() req: any) {
    // If accessToken not provided in request, use the saved one
    let token = dto.accessToken;
    if (!token) {
      const config = await this.waService.obtenerConfig(this.clienteIdDe(req));
      token = config.accessToken;
    }
    return this.waService.testConexion(token, dto.phoneNumberId)
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async obtenerEstado(@Request() req: any) {
    return this.waService.obtenerEstadisticas(this.clienteIdDe(req))
  }

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async enviarMensaje(@Body() dto: EnviarMensajeDto, @Request() req: any) {
    const config = await this.waService.obtenerConfig(this.clienteIdDe(req))
    const result = await this.waService.enviarTexto(dto.celular, dto.mensaje, config)
    return new SuccessResponseDto(result, 'Mensaje enviado')
  }

  /** Sube un adjunto (imagen/documento/audio) desde el panel para mandarlo manualmente por WhatsApp. */
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: adjuntosStorage, limits: { fileSize: 25 * 1024 * 1024 } }))
  async subirAdjunto(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo')
    const tipo = file.mimetype.startsWith('image/') ? 'image' : file.mimetype.startsWith('audio/') ? 'audio' : 'document'
    return new SuccessResponseDto({
      url: `${baseUrlAssets()}/uploads/conversaciones/${file.filename}`,
      tipo,
      nombre: file.originalname,
    })
  }

  /** Manda un adjunto ya subido al número indicado (imagen/documento/audio). */
  @UseGuards(JwtAuthGuard)
  @Post('send-adjunto')
  async enviarAdjunto(@Body() dto: EnviarAdjuntoDto, @Request() req: any) {
    const config = await this.waService.obtenerConfig(this.clienteIdDe(req))
    if (dto.tipo === 'image') await this.waService.enviarImagen(dto.celular, dto.url, dto.caption || '', config)
    else if (dto.tipo === 'audio') await this.waService.enviarAudio(dto.celular, dto.url, config)
    else await this.waService.enviarDocumento(dto.celular, dto.url, dto.nombre || 'archivo', dto.caption || '', config)
    return new SuccessResponseDto(null, 'Adjunto enviado')
  }

  /**
   * SUPER_ADMIN (usuario.cliente_id NULL) administra WhatsApp de un cliente concreto
   * seleccionado en el frontend — sin este fallback, req.user.clienteId es null y la
   * config se guarda/lee de un tenant inexistente (el mismo gotcha ya resuelto en
   * agentes-humanos, pendiente aquí desde el inicio de este controller).
   */
  private clienteIdDe(req: any): string {
    const deSesion = req.user?.clienteId
    if (deSesion) return String(deSesion)
    const deQuery = req.query?.clienteId
    if (deQuery) return String(deQuery)
    throw new BadRequestException('Debes indicar el cliente a administrar (parámetro clienteId)')
  }
}
