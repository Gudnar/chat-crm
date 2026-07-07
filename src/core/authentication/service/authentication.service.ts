import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsuarioService } from '../../usuario/service/usuario.service'
import { AgenteHumanoService } from '../../agente-humano/service/agente-humano.service'
import { TextService } from '../../../common/lib/text.service'
import { Status, Configurations, Roles } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { BaseService } from '../../../common/base/base-service'
import dayjs from 'dayjs'

@Injectable()
export class AuthenticationService extends BaseService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
    private readonly agenteHumanoService: AgenteHumanoService,
  ) {
    super(AuthenticationService.name)
  }

  async validarUsuario(usuario: string, contrasenaBase64: string) {
    const respuesta = await this.usuarioService.buscarUsuario(usuario)

    if (!respuesta) return null

    if (respuesta.estado === Status.INACTIVE)
      throw new UnauthorizedException(Messages.INACTIVE_USER)

    if (respuesta.estado === Status.ELIMINATE)
      throw new UnauthorizedException(Messages.ELIMINATE_USER)

    if (respuesta.intentos >= Configurations.WRONG_LOGIN_LIMIT) {
      if (respuesta.fechaBloqueo && dayjs().isBefore(dayjs(respuesta.fechaBloqueo))) {
        throw new UnauthorizedException(Messages.USER_BLOCKED)
      }
      await this.usuarioService.actualizarDatosBloqueo(respuesta.id, null, null)
    }

    const pass = TextService.decodeBase64(contrasenaBase64)
    const valid = await TextService.compare(pass, respuesta.contrasena)

    if (!valid) {
      const intentos = (respuesta.intentos || 0) + 1
      if (intentos >= Configurations.WRONG_LOGIN_LIMIT) {
        const fecha = dayjs().add(Configurations.MINUTES_LOGIN_LOCK, 'minute').toDate()
        await this.usuarioService.actualizarDatosBloqueo(respuesta.id, null, fecha)
      } else {
        await this.usuarioService.actualizarContadorBloqueos(respuesta.id, intentos)
      }
      throw new UnauthorizedException(Messages.INVALID_USER_CREDENTIALS)
    }

    if (respuesta.intentos > 0) {
      await this.usuarioService.actualizarContadorBloqueos(respuesta.id, 0)
    }

    return { id: respuesta.id, roles: [respuesta.rol], clienteId: respuesta.clienteId ?? null }
  }

  async autenticar(user: { id: string; roles: string[]; clienteId: string | null }) {
    const userData = await this.usuarioService.buscarUsuarioId(user.id)
    const payload = { id: user.id, roles: user.roles, clienteId: user.clienteId ?? null }
    const access_token = this.jwtService.sign(payload)
    this.logger.log(`Usuario autenticado: ${user.id}`)

    // Si es un agente humano, registrar su sesión y ponerlo disponible
    if (user.roles.includes(Roles.AGENTE_HUMANO)) {
      await this.agenteHumanoService.registrarSesion(user.id)
    }

    return {
      data: { access_token, ...userData },
    }
  }

  async cerrarSesion(usuarioId: string, roles: string[]): Promise<void> {
    if (roles.includes(Roles.AGENTE_HUMANO)) {
      await this.agenteHumanoService.cerrarSesion(usuarioId)
    }
  }
}
