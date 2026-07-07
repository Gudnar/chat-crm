import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export interface ParametroHerramienta {
    nombre: string;
    tipo: 'string' | 'number' | 'integer' | 'boolean' | 'enum';
    descripcion: string;
    requerido: boolean;
    opciones?: string[];
    minimo?: number;
    maximo?: number;
}
export declare class Herramienta extends AuditoriaEntity {
    id: string;
    agenteId: string;
    nombre: string;
    label: string;
    descripcion: string;
    parametros: string[];
    activa: boolean;
    autoConfirmar: boolean;
    confianzaMinima: number;
    color: string;
    icono: string;
    ejemplo?: string;
    constructor(data?: Partial<Herramienta>);
}
