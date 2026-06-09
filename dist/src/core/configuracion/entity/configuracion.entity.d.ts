import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class Configuracion extends AuditoriaEntity {
    id: string;
    clave: string;
    valor?: string;
    tipo: string;
    descripcion?: string;
    esSecreto: boolean;
    constructor(data?: Partial<Configuracion>);
}
