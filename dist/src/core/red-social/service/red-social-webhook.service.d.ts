import { RedSocialService } from './red-social.service';
import { ConversacionService } from '../../conversacion/service/conversacion.service';
import { AgenteService } from '../../agente/service/agente.service';
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service';
export declare class RedSocialWebhookService {
    private readonly redSocialService;
    private readonly conversacionService;
    private readonly agenteService;
    private readonly confClienteService;
    private readonly logger;
    constructor(redSocialService: RedSocialService, conversacionService: ConversacionService, agenteService: AgenteService, confClienteService: ConfiguracionClienteService);
    procesarEventoInstagram(entry: any): Promise<void>;
    procesarEventoFacebook(entry: any): Promise<void>;
    private procesarDM;
    private procesarComentarioIG;
    private procesarComentarioFB;
    importarComentariosComoConversaciones(postId: string, clienteId: string | null): Promise<{
        importados: number;
    }>;
    private resolverAgenteParaPost;
    private encontrarOCrearConversacion;
    private llamarClaude;
    private llamarClaudeUnico;
    private obtenerApiKey;
}
