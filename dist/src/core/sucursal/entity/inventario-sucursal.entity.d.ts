import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class InventarioSucursal extends AuditoriaEntity {
    id: string;
    sucursalId: string;
    productoId: string;
    stock?: number;
    stockMinimo: number;
    activo: boolean;
    constructor(data?: Partial<InventarioSucursal>);
}
