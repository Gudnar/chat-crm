export declare class CreateSucursalDto {
    nombre: string;
    codigo: string;
    direccion?: string;
    telefono?: string;
    latitud?: number;
    longitud?: number;
    horarios?: Record<string, any>;
    aceptaPagoQr?: boolean;
    aceptaPagoEfectivo?: boolean;
    qrImagenUrl?: string;
}
export declare class UpdateSucursalDto extends CreateSucursalDto {
    activo?: boolean;
    nombre: string;
    codigo: string;
}
