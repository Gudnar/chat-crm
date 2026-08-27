import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class AgenteGoogleCalendar extends AuditoriaEntity {
    id: string;
    agenteId: string;
    clienteId: string;
    googleEmail?: string;
    accessToken: string;
    refreshToken: string;
    expiraEn?: Date;
    calendarId: string;
    syncToken?: string | null;
    activo: boolean;
    constructor(data?: Partial<AgenteGoogleCalendar>);
}
