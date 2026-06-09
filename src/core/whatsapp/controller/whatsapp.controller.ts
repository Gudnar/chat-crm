import { Body, Controller, Get, Post, Query, Res, UseGuards, Request, HttpCode, Logger } from '@nestjs/common'
import { Response } from 'express'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { WhatsappService } from '../service/whatsapp.service'
import { WhatsappWebhookService } from '../service/whatsapp-webhook.service'
import { RedSocialWebhookService } from '../../red-social/service/red-social-webhook.service'
import { RedSocialService } from '../../red-social/service/red-social.service'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'
import { WhatsappConfigDto, EnviarMensajeDto, TestConexionDto, WaWebhookMessage, WaContact } from '../dto/whatsapp.dto'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'

@Controller('whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name)

  constructor(
    private readonly waService: WhatsappService,
    private readonly webhookService: WhatsappWebhookService,
    private readonly redSocialWebhookService: RedSocialWebhookService,
    private readonly redSocialService: RedSocialService,
    private readonly confClienteService: ConfiguracionClienteService,
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

  // ── Authenticated endpoints ───────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('config')
  async obtenerConfig(@Request() req: any) {
    const config = await this.waService.obtenerConfig(req.user.clienteId)
    return { ...config, accessToken: config.accessToken ? '••••••••••••••••' : '' }
  }

  @UseGuards(JwtAuthGuard)
  @Post('config')
  async guardarConfig(@Body() dto: WhatsappConfigDto, @Request() req: any) {
    await this.waService.guardarConfig(req.user.clienteId, dto, req.user.id)
    return new SuccessResponseDto(null, 'Configuración WhatsApp guardada correctamente')
  }

  @UseGuards(JwtAuthGuard)
  @Post('test-connection')
  async testConexion(@Body() dto: TestConexionDto) {
    return this.waService.testConexion(dto.accessToken, dto.phoneNumberId)
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async obtenerEstado(@Request() req: any) {
    return this.waService.obtenerEstadisticas(req.user.clienteId)
  }

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async enviarMensaje(@Body() dto: EnviarMensajeDto, @Request() req: any) {
    const config = await this.waService.obtenerConfig(req.user.clienteId)
    const result = await this.waService.enviarTexto(dto.celular, dto.mensaje, config)
    return new SuccessResponseDto(result, 'Mensaje enviado')
  }
}
