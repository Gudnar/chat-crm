import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class BaseConocimiento extends AuditoriaEntity {
    id: string;
    agenteId: string;
    pregunta: string;
    respuesta: string;
    categoria?: string;
    activo: boolean;
    orden: number;
    constructor(data?: Partial<BaseConocimiento>);
}
