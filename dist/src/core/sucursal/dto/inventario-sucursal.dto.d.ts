export declare class CreateInventarioSucursalDto {
    productoId: string;
    stock?: number;
    stockMinimo?: number;
}
export declare class UpdateInventarioSucursalDto {
    stock?: number;
    stockMinimo?: number;
    activo?: boolean;
}
export declare class AjustarStockDto {
    cantidad: number;
}
