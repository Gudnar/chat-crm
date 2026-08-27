import { GoogleCalendarService } from './google-calendar.service';
import { AgenteGoogleCalendarService } from './agente-google-calendar.service';
import { ExcepcionHorarioAgenteService } from '../../reservacion/service/excepcion-horario-agente.service';
export declare class GoogleCalendarPollingService {
    private readonly googleCalendarService;
    private readonly agenteGoogleCalendarService;
    private readonly excepcionHorarioAgenteService;
    private readonly logger;
    constructor(googleCalendarService: GoogleCalendarService, agenteGoogleCalendarService: AgenteGoogleCalendarService, excepcionHorarioAgenteService: ExcepcionHorarioAgenteService);
    cronSincronizacion(): Promise<void>;
    private sincronizarConexion;
    private persistirTokensRenovados;
}
