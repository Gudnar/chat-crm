import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class PromocionTienda extends AuditoriaEntity {
    id: string;
    clienteId: string;
    articuloId: string;
    sucursalId?: string | null;
    precioPromocional: number;
    fechaInicio: Date;
    fechaFin: Date;
    activo: boolean;
    constructor(data?: Partial<PromocionTienda>);
}
