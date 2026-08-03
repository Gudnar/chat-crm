export declare class CreateConversacionDto {
    agenteId: string;
    contacto: string;
    canal?: string;
    etiquetas?: string[];
    notas?: string;
}
export declare class AgregarMensajeDto {
    role: string;
    content: string;
    adjunto?: {
        url: string;
        tipo: string;
        nombre?: string;
    };
    interactivo?: {
        pregunta: string;
        botones: Array<{
            id: string;
            titulo: string;
        }>;
    };
    enlace?: {
        texto: string;
        url: string;
    };
    pidioUbicacion?: boolean;
    ubicacion?: {
        latitud: number;
        longitud: number;
        nombre?: string;
        direccion?: string;
    };
}
export declare class TestAgenteDto {
    agenteId: string;
    mensaje: string;
    historial?: Array<{
        role: string;
        content: string;
    }>;
}
