import { RedSocialService } from '../service/red-social.service';
import { CreateCuentaRedSocialDto, TestConexionMetaDto, UpdateCuentaRedSocialDto } from '../dto/red-social.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class RedSocialClienteController {
    private readonly redSocialService;
    constructor(redSocialService: RedSocialService);
    listarCuentas(clienteId: string, plataforma?: string): Promise<SuccessResponseDto>;
    crearCuenta(clienteId: string, dto: CreateCuentaRedSocialDto, req: any): Promise<SuccessResponseDto>;
    actualizarCuenta(clienteId: string, id: string, dto: UpdateCuentaRedSocialDto, req: any): Promise<SuccessResponseDto>;
    eliminarCuenta(clienteId: string, id: string, req: any): Promise<SuccessResponseDto>;
    testConexion(dto: TestConexionMetaDto): Promise<{
        valida: boolean;
        info?: any;
        mensaje: string;
    }>;
}
