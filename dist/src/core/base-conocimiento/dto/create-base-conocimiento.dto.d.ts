export declare class CreateBaseConocimientoDto {
    pregunta: string;
    respuesta: string;
    categoria?: string;
    orden?: number;
    agenteId?: string;
}
export declare class UpdateBaseConocimientoDto {
    pregunta?: string;
    respuesta?: string;
    categoria?: string;
    activo?: boolean;
    orden?: number;
}
