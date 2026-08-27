import { Repository } from 'typeorm';
import { Credentials } from 'google-auth-library';
import { AgenteGoogleCalendar } from '../entity/agente-google-calendar.entity';
import { BaseService } from '../../../common/base/base-service';
export declare class AgenteGoogleCalendarService extends BaseService {
    private readonly repo;
    constructor(repo: Repository<AgenteGoogleCalendar>);
    obtenerPorAgente(agenteId: string, clienteId: string): Promise<AgenteGoogleCalendar | null>;
    listarActivas(): Promise<AgenteGoogleCalendar[]>;
    guardarConexion(agenteId: string, clienteId: string, tokens: Credentials, googleEmail: string | undefined, usuarioCreacion: string): Promise<AgenteGoogleCalendar>;
    actualizarTokens(id: string, tokens: Credentials): Promise<void>;
    actualizarSyncToken(id: string, syncToken: string | null): Promise<void>;
    desconectar(agenteId: string, clienteId: string, usuarioModificacion: string): Promise<AgenteGoogleCalendar | null>;
}
