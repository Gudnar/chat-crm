export declare class CreateClienteFinalDto {
    nombre: string;
    telefono: string;
    sucursalId?: string;
    direcciones?: Array<{
        id?: string;
        nombre?: string;
        direccion: string;
        latitud?: number;
        longitud?: number;
        activa?: boolean;
    }>;
    notas?: string;
}
export declare class UpdateClienteFinalDto extends CreateClienteFinalDto {
    nombre: string;
    telefono: string;
}
