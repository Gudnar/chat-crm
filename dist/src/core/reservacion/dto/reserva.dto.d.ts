export declare class CreateReservaDto {
    agenteId: string;
    servicioAgenteId?: string;
    conversacionId?: string;
    contactoNombre: string;
    contactoTelefono?: string;
    contactoEmail?: string;
    fechaInicio: string;
    duracionMinutos?: number;
    titulo: string;
    descripcion?: string;
    tipoServicio?: string;
}
export declare class UpdateReservaDto {
    fechaInicio?: string;
    duracionMinutos?: number;
    titulo?: string;
    descripcion?: string;
    notasInternas?: string;
}
export declare class ActualizarEstadoReservaDto {
    estado: string;
    resultado?: string;
    notasInternas?: string;
}
