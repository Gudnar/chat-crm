import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBody, ApiTags } from '@nestjs/swagger'
import { AuthenticationService } from '../service/authentication.service'
import { LoginDto } from '../dto/login.dto'
import { ActualizarTemaDto } from '../dto/actualizar-tema.dto'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'
import { UsuarioService } from '../../usuario/service/usuario.service'

@ApiTags('Autenticación')
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly usuarioService: UsuarioService,
  ) {}

  @ApiBody({ type: LoginDto })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: any): Promise<SuccessResponseDto> {
    const result = await this.authService.autenticar(req.user)
    return new SuccessResponseDto(result.data, 'Inicio de sesión exitoso')
  }

  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  async perfil(@Request() req: any): Promise<SuccessResponseDto> {
    return new SuccessResponseDto(req.user)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('tema')
  async actualizarTema(@Body() dto: ActualizarTemaDto, @Request() req: any): Promise<SuccessResponseDto> {
    await this.usuarioService.actualizarTema(req.user.id, dto.tema)
    return new SuccessResponseDto(null, 'Tema actualizado')
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req: any): Promise<SuccessResponseDto> {
    await this.authService.cerrarSesion(req.user.id, req.user.roles ?? [])
    return new SuccessResponseDto(null, 'Sesión cerrada correctamente')
  }
}
