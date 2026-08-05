import { AgenteService } from '../../agente/service/agente.service';
import { ReservacionService } from '../../reservacion/service/reservacion.service';
import { ConversacionService } from '../../conversacion/service/conversacion.service';
import { PlantillaWhatsappService } from './plantilla-whatsapp.service';
import { WhatsappService } from './whatsapp.service';
export declare class RecordatorioCitaService {
    private readonly agenteService;
    private readonly reservacionService;
    private readonly conversacionService;
    private readonly plantillaService;
    private readonly waService;
    private readonly logger;
    constructor(agenteService: AgenteService, reservacionService: ReservacionService, conversacionService: ConversacionService, plantillaService: PlantillaWhatsappService, waService: WhatsappService);
    cronRecordatoriosCita(): Promise<void>;
    private procesarAgente;
    private procesarReserva;
    private enviarPorPlantilla;
}
