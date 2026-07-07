import { BaseEntity } from 'typeorm';
export declare class ActividadAgenteHumano extends BaseEntity {
    id: string;
    agenteHumanoId: string;
    conversacionId?: string | null;
    tipoActividad: string;
    detalles: Record<string, any>;
    timestamp: Date;
    clienteId: string;
    constructor(data?: Partial<ActividadAgenteHumano>);
}
