export declare class OpcionSeleccionadaDto {
    grupoId: string;
    opcionId: string;
}
export declare class AgregarItemCarritoDto {
    articuloId: string;
    cantidad?: number;
    notas?: string;
    opcionesSeleccionadas?: OpcionSeleccionadaDto[];
}
export declare class ActualizarItemCarritoDto {
    cantidad?: number;
    notas?: string;
    opcionesSeleccionadas?: OpcionSeleccionadaDto[];
}
export declare class ElegirSucursalDto {
    sucursalId: string;
}
export declare class ConfirmarPedidoDto {
    metodoPago?: string;
}
