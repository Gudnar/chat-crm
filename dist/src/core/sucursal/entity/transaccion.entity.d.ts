import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class Transaccion extends AuditoriaEntity {
    id: string;
    clienteId: string;
    sucursalId: string;
    pedidoId?: string;
    cajaSucursalId?: string;
    tipo: 'venta' | 'reembolso' | 'gasto' | 'ingreso_manual';
    metodoPago?: 'qr' | 'efectivo' | 'transferencia' | 'otro';
    monto: number;
    estadoTransaccion: 'pendiente' | 'confirmado' | 'anulado';
    referencia?: string;
    descripcion?: string;
    fecha: Date;
    constructor(data?: Partial<Transaccion>);
}
