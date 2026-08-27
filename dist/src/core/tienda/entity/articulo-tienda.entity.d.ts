import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export interface OpcionGrupoTienda {
    id: string;
    nombre: string;
    precioExtra: number;
}
export interface GrupoOpcionesTienda {
    id: string;
    nombre: string;
    tipo: 'unica' | 'multiple';
    obligatorio: boolean;
    min: number;
    max: number;
    opciones: OpcionGrupoTienda[];
}
export declare class ArticuloTienda extends AuditoriaEntity {
    id: string;
    clienteId: string;
    nombre: string;
    descripcion?: string;
    categoria?: string;
    imagenUrl?: string;
    precio: number;
    moneda: string;
    gruposOpciones: GrupoOpcionesTienda[];
    activo: boolean;
    orden: number;
    constructor(data?: Partial<ArticuloTienda>);
}
