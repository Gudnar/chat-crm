import { GoogleCalendarService } from './google-calendar.service';
import { AgenteGoogleCalendarService } from './agente-google-calendar.service';
import { Reserva } from '../../reservacion/entity/reserva.entity';
export declare class GoogleCalendarSyncService {
    private readonly googleCalendarService;
    private readonly agenteGoogleCalendarService;
    private readonly logger;
    constructor(googleCalendarService: GoogleCalendarService, agenteGoogleCalendarService: AgenteGoogleCalendarService);
    sincronizarCreacion(reserva: Reserva): Promise<string | null>;
    sincronizarActualizacion(reserva: Reserva): Promise<void>;
    sincronizarCancelacion(reserva: Reserva): Promise<void>;
    private persistirTokensRenovados;
}
