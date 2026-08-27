import { ConfigService } from '@nestjs/config';
import { calendar_v3 } from 'googleapis';
import { Credentials } from 'google-auth-library';
export interface EventoCrm {
    titulo: string;
    descripcion?: string;
    fechaInicio: Date;
    fechaFin: Date;
    reservaId: string;
}
export interface ListaCambiosResultado {
    eventos: calendar_v3.Schema$Event[];
    nextSyncToken?: string | null;
    requiereSyncCompleta: boolean;
}
export declare class GoogleCalendarService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    private redirectUri;
    private nuevoCliente;
    generarUrlAutorizacion(state: string): string;
    intercambiarCodigo(code: string): Promise<Credentials>;
    obtenerEmailCuenta(tokens: Credentials): Promise<string | undefined>;
    revocarToken(accessToken: string): Promise<void>;
    private clienteAutenticado;
    crearEvento(credenciales: {
        accessToken: string;
        refreshToken: string;
        expiraEn?: Date | null;
        calendarId: string;
    }, evento: EventoCrm, onTokensRenovados: (tokens: Credentials) => void): Promise<string | null>;
    actualizarEvento(credenciales: {
        accessToken: string;
        refreshToken: string;
        expiraEn?: Date | null;
        calendarId: string;
    }, googleEventId: string, evento: EventoCrm, onTokensRenovados: (tokens: Credentials) => void): Promise<void>;
    eliminarEvento(credenciales: {
        accessToken: string;
        refreshToken: string;
        expiraEn?: Date | null;
        calendarId: string;
    }, googleEventId: string, onTokensRenovados: (tokens: Credentials) => void): Promise<void>;
    listarCambios(credenciales: {
        accessToken: string;
        refreshToken: string;
        expiraEn?: Date | null;
        calendarId: string;
        syncToken?: string | null;
    }, onTokensRenovados: (tokens: Credentials) => void): Promise<ListaCambiosResultado>;
}
