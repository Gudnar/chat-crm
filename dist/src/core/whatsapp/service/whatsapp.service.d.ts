import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service';
export interface WaConfig {
    accessToken: string;
    phoneNumberId: string;
    wabaId: string;
    verifyToken: string;
    agenteId: string;
    enabled: boolean;
}
export declare class WhatsappService {
    private readonly confClienteService;
    private readonly logger;
    constructor(confClienteService: ConfiguracionClienteService);
    obtenerConfig(clienteId: string): Promise<WaConfig>;
    guardarConfig(clienteId: string, data: Partial<WaConfig>, usuarioId: string): Promise<void>;
    private apiPost;
    enviarTexto(to: string, text: string, config: WaConfig): Promise<any>;
    marcarLeido(messageId: string, config: WaConfig): Promise<void>;
    mostrarTyping(messageId: string, config: WaConfig): Promise<void>;
    testConexion(accessToken: string, phoneNumberId: string): Promise<{
        valida: boolean;
        info?: any;
        mensaje: string;
    }>;
    obtenerEstadisticas(clienteId: string): Promise<{
        valida: boolean;
        stats?: any;
        mensaje: string;
    }>;
}
