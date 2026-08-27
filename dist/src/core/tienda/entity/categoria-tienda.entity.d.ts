import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class CategoriaTienda extends AuditoriaEntity {
    id: string;
    clienteId: string;
    nombre: string;
    imagenUrl?: string;
    orden: number;
    activo: boolean;
    constructor(data?: Partial<CategoriaTienda>);
}
