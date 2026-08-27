import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class ExcepcionHorarioAgente extends AuditoriaEntity {
    id: string;
    agenteId: string | null;
    clienteId: string;
    fechaInicio: string;
    fechaFin: string;
    motivo: string;
    tipo: string;
    horaInicio?: string | null;
    horaFin?: string | null;
    googleEventId?: string | null;
    constructor(data?: Partial<ExcepcionHorarioAgente>);
}
