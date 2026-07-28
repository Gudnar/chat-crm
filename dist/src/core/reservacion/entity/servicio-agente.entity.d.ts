import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class ServicioAgente extends AuditoriaEntity {
    id: string;
    agenteId: string;
    clienteId: string;
    nombre: string;
    descripcion?: string;
    duracionMinutos: number;
    precio?: number;
    activo: boolean;
    constructor(data?: Partial<ServicioAgente>);
}
