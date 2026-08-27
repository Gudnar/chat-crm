import { BadRequestException, Controller, Delete, Get, Query, Request, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { AgenteHumanoService } from '../../agente-humano/service/agente-humano.service'
import { GoogleCalendarService } from '../service/google-calendar.service'
import { AgenteGoogleCalendarService } from '../service/agente-google-calendar.service'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'
import { USUARIO_SISTEMA } from '../../../common/constants'

interface EstadoConexionGoogle {
  agenteId: string
  clienteId: string
}

@ApiTags('Google Calendar')
@Controller('google-calendar')
export class GoogleCalendarController {
  constructor(
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly agenteGoogleCalendarService: AgenteGoogleCalendarService,
    private readonly agenteHumanoService: AgenteHumanoService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Get('conectar')
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENTE_HUMANO')
  async conectar(@Request() req: any): Promise<SuccessResponseDto> {
    const agente = await this.agenteHumanoService.obtenerPorUsuarioId(req.user.id)
    if (!agente) throw new BadRequestException('No tienes un agente humano asociado a tu usuario')

    const state = this.jwtService.sign({ agenteId: agente.id, clienteId: agente.clienteId } as EstadoConexionGoogle, { expiresIn: '10m' })
    const url = this.googleCalendarService.generarUrlAutorizacion(state)
    return new SuccessResponseDto({ url })
  }

  /** Público — Google redirige acá después de que el agente autoriza (o cancela) la conexión. */
  @Get('oauth/callback')
  async callback(@Query('code') code: string, @Query('state') state: string, @Query('error') error: string, @Res() res: Response): Promise<void> {
    const frontendUrl = (this.configService.get<string>('FRONTEND_URL') || 'http://localhost:8083').replace(/\/$/, '')

    if (error || !code || !state) {
      res.redirect(`${frontendUrl}/admin/mis-citas?google=error`)
      return
    }

    let datos: EstadoConexionGoogle
    try {
      datos = this.jwtService.verify<EstadoConexionGoogle>(state)
    } catch {
      res.redirect(`${frontendUrl}/admin/mis-citas?google=error`)
      return
    }

    try {
      const tokens = await this.googleCalendarService.intercambiarCodigo(code)
      const email = await this.googleCalendarService.obtenerEmailCuenta(tokens)
      await this.agenteGoogleCalendarService.guardarConexion(datos.agenteId, datos.clienteId, tokens, email, USUARIO_SISTEMA)
      res.redirect(`${frontendUrl}/admin/mis-citas?google=conectado`)
    } catch (err: any) {
      res.redirect(`${frontendUrl}/admin/mis-citas?google=error`)
    }
  }

  @Get('estado')
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENTE_HUMANO')
  async estado(@Request() req: any): Promise<SuccessResponseDto> {
    const agente = await this.agenteHumanoService.obtenerPorUsuarioId(req.user.id)
    if (!agente) throw new BadRequestException('No tienes un agente humano asociado a tu usuario')

    const conexion = await this.agenteGoogleCalendarService.obtenerPorAgente(agente.id, agente.clienteId)
    return new SuccessResponseDto({ conectado: !!conexion, email: conexion?.googleEmail })
  }

  @Delete('conectar')
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AGENTE_HUMANO')
  async desconectar(@Request() req: any): Promise<SuccessResponseDto> {
    const agente = await this.agenteHumanoService.obtenerPorUsuarioId(req.user.id)
    if (!agente) throw new BadRequestException('No tienes un agente humano asociado a tu usuario')

    const conexion = await this.agenteGoogleCalendarService.obtenerPorAgente(agente.id, agente.clienteId)
    if (conexion) await this.googleCalendarService.revocarToken(conexion.accessToken)
    await this.agenteGoogleCalendarService.desconectar(agente.id, agente.clienteId, req.user.id)
    return new SuccessResponseDto(null, 'Google Calendar desconectado')
  }
}
