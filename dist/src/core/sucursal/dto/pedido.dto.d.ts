export declare class CreatePedidoDto {
    sucursalId: string;
    contactoTelefono: string;
    clienteFinalId?: string;
    conversacionId?: string;
    items: Array<{
        productoId: string;
        nombre: string;
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
        notas?: string;
    }>;
    subtotal: number;
    descuento?: number;
    total: number;
    tipoEntrega?: 'recojo' | 'delivery';
    direccionEntrega?: {
        direccion: string;
        latitud?: number;
        longitud?: number;
        notas?: string;
    };
    notas?: string;
}
export declare class UpdatePedidoEstadoDto {
    estadoPedido: string;
    motivoCancelacion?: string;
}
export declare class UpdatePedidoEstadoPagoDto {
    estadoPago: string;
}
