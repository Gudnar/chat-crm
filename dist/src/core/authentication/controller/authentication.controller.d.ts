import { AuthenticationService } from '../service/authentication.service';
import { ActualizarTemaDto } from '../dto/actualizar-tema.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
import { UsuarioService } from '../../usuario/service/usuario.service';
export declare class AuthenticationController {
    private readonly authService;
    private readonly usuarioService;
    constructor(authService: AuthenticationService, usuarioService: UsuarioService);
    login(req: any): Promise<SuccessResponseDto>;
    perfil(req: any): Promise<SuccessResponseDto>;
    actualizarTema(dto: ActualizarTemaDto, req: any): Promise<SuccessResponseDto>;
    logout(req: any): Promise<SuccessResponseDto>;
}
