export declare class WhatsappConfigDto {
    accessToken?: string;
    phoneNumberId?: string;
    wabaId?: string;
    verifyToken?: string;
    agenteId?: string;
    enabled?: boolean;
}
export declare class EnviarMensajeDto {
    celular: string;
    mensaje: string;
}
export declare class EnviarAdjuntoDto {
    celular: string;
    url: string;
    tipo: string;
    nombre?: string;
    caption?: string;
}
export declare class TestConexionDto {
    accessToken: string;
    phoneNumberId: string;
}
export interface WaWebhookMessage {
    id: string;
    from: string;
    timestamp: string;
    type: string;
    text?: {
        body: string;
    };
    button?: {
        payload: string;
        text: string;
    };
    interactive?: {
        type: string;
        button_reply?: {
            id: string;
            title: string;
        };
        list_reply?: {
            id: string;
            title: string;
        };
    };
    image?: {
        id: string;
        mime_type: string;
        sha256: string;
        caption?: string;
    };
    audio?: {
        id: string;
        mime_type: string;
    };
    document?: {
        id: string;
        filename: string;
        mime_type: string;
        caption?: string;
    };
    location?: {
        latitude: number;
        longitude: number;
        name?: string;
        address?: string;
    };
}
export interface WaContact {
    profile: {
        name: string;
    };
    wa_id: string;
}
