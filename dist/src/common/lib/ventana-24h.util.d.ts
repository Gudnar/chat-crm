interface MensajeConTimestamp {
    role: string;
    timestamp: string;
}
export declare function estaFueraDeVentana24h(mensajes: MensajeConTimestamp[]): boolean;
export {};
