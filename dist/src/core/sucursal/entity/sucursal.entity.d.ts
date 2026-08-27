import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class Sucursal extends AuditoriaEntity {
    id: string;
    clienteId: string;
    nombre: string;
    codigo: string;
    direccion?: string;
    telefono?: string;
    latitud?: number;
    longitud?: number;
    horarios: Record<string, any>;
    aceptaPagoQr: boolean;
    aceptaPagoEfectivo: boolean;
    qrImagenUrl?: string;
    activo: boolean;
    constructor(data?: Partial<Sucursal>);
}
