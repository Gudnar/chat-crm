import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class Pedido extends AuditoriaEntity {
    id: string;
    clienteId: string;
    sucursalId: string;
    clienteFinalId?: string;
    conversacionId?: string;
    contactoTelefono: string;
    codigoPedido: string;
    items: Array<{
        productoId: string;
        nombre: string;
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
        notas?: string;
    }>;
    subtotal: number;
    descuento: number;
    total: number;
    tipoEntrega: 'recojo' | 'delivery';
    direccionEntrega?: {
        direccion: string;
        latitud?: number;
        longitud?: number;
        notas?: string;
    };
    estadoPedido: 'pendiente_confirmacion' | 'confirmado' | 'en_preparacion' | 'listo' | 'en_camino' | 'entregado' | 'cancelado';
    estadoPago: 'pendiente' | 'pagado' | 'parcial' | 'anulado';
    fechaConfirmacion?: Date;
    fechaListo?: Date;
    fechaEntrega?: Date;
    motivoCancelacion?: string;
    notas?: string;
    constructor(data?: Partial<Pedido>);
}
