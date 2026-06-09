import { Response } from 'express';
import { RedSocialService } from '../service/red-social.service';
import { RedSocialWebhookService } from '../service/red-social-webhook.service';
import { CreateCuentaRedSocialDto, UpdateCuentaRedSocialDto, CreateRedSocialPostDto, UpdateRedSocialPostDto, TestConexionMetaDto, EnviarDMDto } from '../dto/red-social.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class RedSocialController {
    private readonly redSocialService;
    private readonly webhookService;
    private readonly logger;
    constructor(redSocialService: RedSocialService, webhookService: RedSocialWebhookService);
    verificarWebhook(query: any, res: Response): Promise<void>;
    recibirWebhook(body: any): Promise<string>;
    listarCuentas(req: any): Promise<SuccessResponseDto>;
    crearCuenta(dto: CreateCuentaRedSocialDto, req: any): Promise<SuccessResponseDto>;
    actualizarCuenta(id: string, dto: UpdateCuentaRedSocialDto, req: any): Promise<SuccessResponseDto>;
    eliminarCuenta(id: string, req: any): Promise<SuccessResponseDto>;
    testConexion(dto: TestConexionMetaDto): Promise<{
        valida: boolean;
        info?: any;
        mensaje: string;
    }>;
    enviarDM(dto: EnviarDMDto, req: any): Promise<SuccessResponseDto>;
    enriquecerComentaristas(req: any): Promise<SuccessResponseDto>;
    importarComentarios(id: string, req: any): Promise<SuccessResponseDto>;
    sincronizarPosts(id: string, req: any): Promise<SuccessResponseDto>;
    listarPosts(req: any, cuentaId?: string): Promise<SuccessResponseDto>;
    crearPost(dto: CreateRedSocialPostDto, req: any): Promise<SuccessResponseDto>;
    actualizarPost(id: string, dto: UpdateRedSocialPostDto, req: any): Promise<SuccessResponseDto>;
    eliminarPost(id: string, req: any): Promise<SuccessResponseDto>;
}
