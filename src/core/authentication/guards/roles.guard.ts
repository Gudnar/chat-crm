import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requeridos = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requeridos || requeridos.length === 0) return true

    const { user } = context.switchToHttp().getRequest()
    const userRoles: string[] = user?.roles ?? (user?.rol ? [user.rol] : [])
    if (userRoles.length === 0) throw new ForbiddenException('Sin rol asignado.')

    if (!requeridos.some(r => userRoles.includes(r))) {
      throw new ForbiddenException('No tiene permisos para realizar esta acción.')
    }

    return true
  }
}
