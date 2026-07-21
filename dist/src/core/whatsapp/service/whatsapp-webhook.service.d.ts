import { WhatsappService } from './whatsapp.service';
import { ConversacionService } from '../../conversacion/service/conversacion.service';
import { AgenteService } from '../../agente/service/agente.service';
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service';
import { HerramientaService } from '../../herramienta/service/herramienta.service';
import { ToolExecutorService } from '../../herramienta/service/tool-executor.service';
import { BaseConocimientoService } from '../../base-conocimiento/service/base-conocimiento.service';
import { WaWebhookMessage } from '../dto/whatsapp.dto';
export declare class WhatsappWebhookService {
    private readonly waService;
    private readonly conversacionService;
    private readonly agenteService;
    private readonly confClienteService;
    private readonly herramientaService;
    private readonly toolExecutor;
    private readonly baseConocimientoService;
    private readonly logger;
    constructor(waService: WhatsappService, conversacionService: ConversacionService, agenteService: AgenteService, confClienteService: ConfiguracionClienteService, herramientaService: HerramientaService, toolExecutor: ToolExecutorService, baseConocimientoService: BaseConocimientoService);
    procesarMensajeEntrante(rawMessage: WaWebhookMessage, contactName: string, phoneNumberId: string): Promise<void>;
    private extraerTexto;
    private encontrarOCrearConversacion;
    private llamarClaude;
    private sanitizarRespuesta;
}
