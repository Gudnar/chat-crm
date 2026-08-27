import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class ArticuloSucursal extends AuditoriaEntity {
    id: string;
    articuloId: string;
    sucursalId: string;
    activo: boolean;
    stock?: number | null;
    constructor(data?: Partial<ArticuloSucursal>);
}
