import { AgenteService } from '../../agente/service/agente.service';
import { ConversacionService } from '../../conversacion/service/conversacion.service';
import { WhatsappService } from './whatsapp.service';
export declare class RecordatorioService {
    private readonly agenteService;
    private readonly conversacionService;
    private readonly waService;
    private readonly logger;
    constructor(agenteService: AgenteService, conversacionService: ConversacionService, waService: WhatsappService);
    cronRecordatorios(): Promise<void>;
    private procesarAgente;
}
