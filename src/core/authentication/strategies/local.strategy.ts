import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { AuthenticationService } from '../service/authentication.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthenticationService) {
    super({ usernameField: 'usuario', passwordField: 'contrasena' })
  }

  async validate(usuario: string, contrasena: string): Promise<any> {
    const user = await this.authService.validarUsuario(usuario, contrasena)
    if (!user) throw new UnauthorizedException('Credenciales inválidas')
    return user
  }
}
