import { AuthenticationService } from '../service/authentication.service';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class AuthenticationController {
    private readonly authService;
    constructor(authService: AuthenticationService);
    login(req: any): Promise<SuccessResponseDto>;
    perfil(req: any): Promise<SuccessResponseDto>;
    logout(): Promise<SuccessResponseDto>;
}
