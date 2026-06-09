import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBody, ApiTags } from '@nestjs/swagger'
import { AuthenticationService } from '../service/authentication.service'
import { LoginDto } from '../dto/login.dto'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'

@ApiTags('Autenticación')
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

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
  @Post('logout')
  async logout(): Promise<SuccessResponseDto> {
    return new SuccessResponseDto(null, 'Sesión cerrada correctamente')
  }
}
