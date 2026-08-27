import { GrupoOpcionesTienda } from '../entity/articulo-tienda.entity';
export declare class CreateArticuloTiendaDto {
    nombre: string;
    descripcion?: string;
    categoria?: string;
    imagenUrl?: string;
    precio: number;
    moneda?: string;
    gruposOpciones?: GrupoOpcionesTienda[];
    orden?: number;
}
export declare class UpdateArticuloTiendaDto extends CreateArticuloTiendaDto {
    activo?: boolean;
    nombre: string;
    precio: number;
}
