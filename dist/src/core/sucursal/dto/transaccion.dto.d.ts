export declare class CreateTransaccionDto {
    tipo: string;
    metodoPago?: string;
    monto: number;
    pedidoId?: string;
    cajaSucursalId?: string;
    referencia?: string;
    descripcion?: string;
    fecha?: Date;
}
