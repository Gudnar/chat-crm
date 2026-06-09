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
}
export declare class TestAgenteDto {
    agenteId: string;
    mensaje: string;
    historial?: Array<{
        role: string;
        content: string;
    }>;
}
