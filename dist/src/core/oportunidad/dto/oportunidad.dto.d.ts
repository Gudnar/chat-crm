export declare class CreateOportunidadDto {
    contactoNombre: string;
    contactoTelefono?: string;
    contactoEmail?: string;
    empresa?: string;
    origen?: string;
    productoInteres?: string;
    montoEstimado?: number;
    moneda?: string;
    prioridad?: string;
    conversacionId?: string;
    asignadoA?: string;
    notas?: string;
}
export declare class UpdateOportunidadDto {
    contactoNombre?: string;
    contactoTelefono?: string;
    contactoEmail?: string;
    empresa?: string;
    origen?: string;
    productoInteres?: string;
    montoEstimado?: number;
    moneda?: string;
    prioridad?: string;
    notas?: string;
}
export declare class CambiarEstadoOportunidadDto {
    estado: string;
    motivo?: string;
}
export declare class RegistrarSeguimientoDto {
    nota?: string;
    proximaAccion?: string;
    proximaAccionFecha?: string;
}
export declare class AsignarOportunidadDto {
    usuarioId: string;
}
export declare class EditarHistorialDto {
    indice: number;
    detalles: string;
}
