import { TipoRecurso } from '../entity/recurso.entity';
export declare class CreateRecursoDto {
    nombre: string;
    tipo?: TipoRecurso;
    categoria?: string;
    keywords?: string[] | string;
    descripcion?: string;
    agenteId?: string;
    urlExterna?: string;
}
export declare class UpdateRecursoDto {
    nombre?: string;
    categoria?: string;
    keywords?: string[] | string;
    descripcion?: string;
    agenteId?: string;
    urlExterna?: string;
    activo?: boolean;
}
