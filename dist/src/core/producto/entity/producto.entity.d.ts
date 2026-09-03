import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class Producto extends AuditoriaEntity {
    id: string;
    clienteId: string;
    nombre: string;
    descripcion?: string;
    marca?: string;
    modelo?: string;
    categoria?: string;
    precio: number;
    precioOferta?: number;
    precio1?: number;
    precio2?: number;
    precio3?: number;
    moneda: string;
    stock?: number;
    fechaDisponibilidad?: string | null;
    imagenes: string[];
    detalles: Record<string, any>;
    activo: boolean;
    constructor(data?: Partial<Producto>);
}
