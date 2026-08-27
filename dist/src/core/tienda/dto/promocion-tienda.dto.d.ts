export declare class CreatePromocionTiendaDto {
    articuloId: string;
    sucursalId?: string;
    precioPromocional: number;
    fechaInicio: string;
    fechaFin: string;
}
export declare class UpdatePromocionTiendaDto {
    sucursalId?: string;
    precioPromocional?: number;
    fechaInicio?: string;
    fechaFin?: string;
    activo?: boolean;
}
