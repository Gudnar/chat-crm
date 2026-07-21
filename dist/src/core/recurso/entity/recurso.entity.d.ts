import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare enum TipoRecurso {
    PDF = "PDF",
    IMAGEN = "IMAGEN",
    AUDIO = "AUDIO",
    VIDEO = "VIDEO"
}
export declare class Recurso extends AuditoriaEntity {
    id: string;
    clienteId: string;
    agenteId?: string;
    nombre: string;
    tipo: TipoRecurso;
    categoria?: string;
    keywords: string[];
    descripcion?: string;
    archivoLocal?: string;
    urlExterna?: string;
    tamanobytes?: number;
    mimeType?: string;
    activo: boolean;
    constructor(data?: Partial<Recurso>);
}
