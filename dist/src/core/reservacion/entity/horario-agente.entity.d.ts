import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class HorarioAgente extends AuditoriaEntity {
    id: string;
    agenteId: string;
    clienteId: string;
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
    activo: boolean;
    constructor(data?: Partial<HorarioAgente>);
}
