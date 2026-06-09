import {
  Body, Controller, Delete, Get, HttpCode, Logger, Param,
  Post, Put, Query, Request, Res, UseGuards,
} from '@nestjs/common'
import { Response } from 'express'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RedSocialService } from '../service/red-social.service'
import { RedSocialWebhookService } from '../service/red-social-webhook.service'
import {
  CreateCuentaRedSocialDto,
  UpdateCuentaRedSocialDto,
  CreateRedSocialPostDto,
  UpdateRedSocialPostDto,
  TestConexionMetaDto,
  EnviarDMDto,
} from '../dto/red-social.dto'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'

@Controller('red-social')
export class RedSocialController {
  private readonly logger = new Logger(RedSocialController.name)

  constructor(
    private readonly redSocialService: RedSocialService,
    private readonly webhookService: RedSocialWebhookService,
  ) {}

  // ── Webhook verification (GET) ────────────────────────────────

  @Get('webhook')
  async verificarWebhook(@Query() query: any, @Res() res: Response): Promise<void> {
    const mode      = query['hub.mode']
    const token     = query['hub.verify_token']
    const challenge = query['hub.challenge']

    const cuenta = await this.redSocialService.resolverCuentaPorVerifyToken(token)

    if (mode === 'subscribe' && cuenta) {
      this.logger.log(`[RS] Webhook verificado para cuenta ${cuenta.id} (${cuenta.plataforma})`)
      res.status(200).send(challenge)
    } else {
      this.logger.warn(`[RS] Verificación fallida — token: ${token}`)
      res.sendStatus(403)
    }
  }

  // ── Webhook receiver (POST) ───────────────────────────────────

  @Post('webhook')
  @HttpCode(200)
  async recibirWebhook(@Body() body: any): Promise<string> {
    try {
      const obj = body.object

      for (const entry of body.entry || []) {
        if (obj === 'instagram') {
          this.webhookService.procesarEventoInstagram(entry)
            .catch(e => this.logger.error(`[IG] async error: ${e.message}`))
        } else if (obj === 'page') {
          this.webhookService.procesarEventoFacebook(entry)
            .catch(e => this.logger.error(`[FB] async error: ${e.message}`))
        }
      }
    } catch (err: any) {
      this.logger.error(`[RS] Error en webhook: ${err.message}`)
    }

    return 'EVENT_RECEIVED'
  }

  // ── Cuentas CRUD ─────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('cuentas')
  async listarCuentas(@Request() req: any) {
    const datos = await this.redSocialService.listarCuentas(req.user.clienteId)
    return new SuccessResponseDto(datos, 'OK')
  }

  @UseGuards(JwtAuthGuard)
  @Post('cuentas')
  async crearCuenta(@Body() dto: CreateCuentaRedSocialDto, @Request() req: any) {
    const datos = await this.redSocialService.crearCuenta(dto, req.user.id, req.user.clienteId)
    return new SuccessResponseDto(datos, 'Cuenta creada correctamente')
  }

  @UseGuards(JwtAuthGuard)
  @Put('cuentas/:id')
  async actualizarCuenta(@Param('id') id: string, @Body() dto: UpdateCuentaRedSocialDto, @Request() req: any) {
    const datos = await this.redSocialService.actualizarCuenta(id, dto, req.user.id, req.user.clienteId)
    return new SuccessResponseDto(datos, 'Cuenta actualizada correctamente')
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cuentas/:id')
  async eliminarCuenta(@Param('id') id: string, @Request() req: any) {
    await this.redSocialService.eliminarCuenta(id, req.user.id, req.user.clienteId)
    return new SuccessResponseDto(null, 'Cuenta eliminada correctamente')
  }

  @UseGuards(JwtAuthGuard)
  @Post('test-conexion')
  async testConexion(@Body() dto: TestConexionMetaDto) {
    return this.redSocialService.testConexion(dto.accessToken, dto.pageId, dto.plataforma)
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-dm')
  async enviarDM(@Body() dto: EnviarDMDto, @Request() req: any) {
    const datos = await this.redSocialService.enviarDMDesdeAgente(
      dto.recipientId,
      dto.texto,
      dto.plataforma,
      req.user.clienteId,
    )
    return new SuccessResponseDto(datos, 'Mensaje enviado')
  }

  // ── Enriquecer nombres de comentaristas desde Meta API ──────

  @UseGuards(JwtAuthGuard)
  @Post('enriquecer-comentaristas')
  async enriquecerComentaristas(@Request() req: any) {
    const datos = await this.redSocialService.enriquecerNombresComentaristas(req.user.clienteId)
    return new SuccessResponseDto(datos, `${datos.actualizadas} posts actualizados con nombres`)
  }

  // ── Importar comentarios históricos como conversaciones ─────

  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/importar-comentarios')
  async importarComentarios(@Param('id') id: string, @Request() req: any) {
    const datos = await this.webhookService.importarComentariosComoConversaciones(id, req.user.clienteId)
    return new SuccessResponseDto(datos, `${datos.importados} comentarios importados como conversaciones`)
  }

  // ── Posts sync ───────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('cuentas/:id/sincronizar')
  async sincronizarPosts(@Param('id') id: string, @Request() req: any) {
    const datos = await this.redSocialService.sincronizarPosts(id, req.user.clienteId, req.user.id)
    return new SuccessResponseDto(datos, `Sincronizado: ${datos.sincronizados} nuevos, ${datos.actualizados} actualizados`)
  }

  // ── Posts CRUD ────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('posts')
  async listarPosts(@Request() req: any, @Query('cuentaId') cuentaId?: string) {
    const datos = await this.redSocialService.listarPosts(req.user.clienteId, cuentaId)
    return new SuccessResponseDto(datos, 'OK')
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts')
  async crearPost(@Body() dto: CreateRedSocialPostDto, @Request() req: any) {
    const datos = await this.redSocialService.crearPost(dto, req.user.id, req.user.clienteId)
    return new SuccessResponseDto(datos, 'Post registrado correctamente')
  }

  @UseGuards(JwtAuthGuard)
  @Put('posts/:id')
  async actualizarPost(@Param('id') id: string, @Body() dto: UpdateRedSocialPostDto, @Request() req: any) {
    const datos = await this.redSocialService.actualizarPost(id, dto, req.user.id, req.user.clienteId)
    return new SuccessResponseDto(datos, 'Post actualizado correctamente')
  }

  @UseGuards(JwtAuthGuard)
  @Delete('posts/:id')
  async eliminarPost(@Param('id') id: string, @Request() req: any) {
    await this.redSocialService.eliminarPost(id, req.user.id, req.user.clienteId)
    return new SuccessResponseDto(null, 'Post eliminado correctamente')
  }
}
