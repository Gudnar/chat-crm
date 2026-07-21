import { TipoRecurso } from './entity/recurso.entity';
export declare const MIME_POR_TIPO: Record<TipoRecurso, string[]>;
export declare const LIMITE_BYTES_POR_TIPO: Record<TipoRecurso, number>;
export declare const LIMITE_BYTES_GLOBAL: number;
export declare function detectarTipo(mimetype: string): TipoRecurso | null;
export declare function mimesPermitidos(): string[];
export declare function formatearBytes(bytes: number): string;
