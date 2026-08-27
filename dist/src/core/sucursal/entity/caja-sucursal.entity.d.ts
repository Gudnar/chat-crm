import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class CajaSucursal extends AuditoriaEntity {
    id: string;
    clienteId: string;
    sucursalId: string;
    usuarioId: string;
    fechaApertura: Date;
    montoApertura: number;
    fechaCierre?: Date;
    montoCierreDeclarado?: number;
    montoCierreCalculado?: number;
    diferencia?: number;
    estadoCaja: 'abierta' | 'cerrada';
    notas?: string;
    constructor(data?: Partial<CajaSucursal>);
}
