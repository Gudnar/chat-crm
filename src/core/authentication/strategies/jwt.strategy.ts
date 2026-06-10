import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'ide_ia_secret',
    })
  }

  async validate(payload: any) {
    return {
      id: payload.id,
      roles: payload.roles,
      rol: payload.roles?.[0] ?? null,
      clienteId: payload.clienteId ?? null,
    }
  }
}
