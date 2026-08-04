/// <reference types="multer" />
import { Response } from 'express';
import { WhatsappService } from '../service/whatsapp.service';
import { WhatsappWebhookService } from '../service/whatsapp-webhook.service';
import { RedSocialWebhookService } from '../../red-social/service/red-social-webhook.service';
import { RedSocialService } from '../../red-social/service/red-social.service';
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service';
import { PlantillaWhatsappService } from '../service/plantilla-whatsapp.service';
import { WhatsappConfigDto, EnviarMensajeDto, EnviarAdjuntoDto, TestConexionDto } from '../dto/whatsapp.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class WhatsappController {
    private readonly waService;
    private readonly webhookService;
    private readonly redSocialWebhookService;
    private readonly redSocialService;
    private readonly confClienteService;
    private readonly plantillaService;
    private readonly logger;
    constructor(waService: WhatsappService, webhookService: WhatsappWebhookService, redSocialWebhookService: RedSocialWebhookService, redSocialService: RedSocialService, confClienteService: ConfiguracionClienteService, plantillaService: PlantillaWhatsappService);
    verificarWebhook(query: any, res: Response): Promise<void>;
    recibirWebhook(body: any): Promise<string>;
    private procesarActualizacionPlantilla;
    obtenerConfig(req: any): Promise<{
        accessToken: string;
        _hasAccessToken: boolean;
        phoneNumberId: string;
        wabaId: string;
        verifyToken: string;
        agenteId: string;
        enabled: boolean;
    }>;
    guardarConfig(dto: WhatsappConfigDto, req: any): Promise<SuccessResponseDto>;
    testConexion(dto: TestConexionDto, req: any): Promise<{
        valida: boolean;
        info?: any;
        mensaje: string;
    }>;
    obtenerEstado(req: any): Promise<{
        valida: boolean;
        stats?: any;
        mensaje: string;
    }>;
    enviarMensaje(dto: EnviarMensajeDto, req: any): Promise<SuccessResponseDto>;
    subirAdjunto(file: Express.Multer.File): Promise<SuccessResponseDto>;
    enviarAdjunto(dto: EnviarAdjuntoDto, req: any): Promise<SuccessResponseDto>;
    private clienteIdDe;
}
