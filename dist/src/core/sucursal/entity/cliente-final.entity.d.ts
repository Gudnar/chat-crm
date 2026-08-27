import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class ClienteFinal extends AuditoriaEntity {
    id: string;
    clienteId: string;
    sucursalId?: string;
    nombre: string;
    telefono: string;
    direcciones: Array<{
        id?: string;
        nombre?: string;
        direccion: string;
        latitud?: number;
        longitud?: number;
        activa?: boolean;
    }>;
    notas?: string;
    totalPedidos: number;
    totalGastado: number;
    ultimaCompra?: Date;
    constructor(data?: Partial<ClienteFinal>);
}
