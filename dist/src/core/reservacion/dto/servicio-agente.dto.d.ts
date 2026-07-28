export declare class CreateServicioAgenteDto {
    agenteId: string;
    nombre: string;
    descripcion?: string;
    duracionMinutos: number;
    precio?: number;
    activo?: boolean;
}
export declare class UpdateServicioAgenteDto {
    nombre?: string;
    descripcion?: string;
    duracionMinutos?: number;
    precio?: number;
    activo?: boolean;
}
