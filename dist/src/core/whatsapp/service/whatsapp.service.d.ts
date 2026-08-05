/// <reference types="node" />
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
    private apiCall;
    crearPlantillaMeta(config: WaConfig, payload: {
        name: string;
        category: string;
        language: string;
        components: any[];
    }): Promise<{
        id: string;
        status: string;
    }>;
    consultarEstadoPlantillaMeta(config: WaConfig, metaTemplateId: string): Promise<{
        status: string;
        rejected_reason?: string;
    }>;
    eliminarPlantillaMeta(config: WaConfig, nombre: string): Promise<void>;
    enviarPlantilla(to: string, nombrePlantilla: string, idioma: string, componentesEnvio: any[], config: WaConfig): Promise<void>;
    crearFlowMeta(config: WaConfig, payload: {
        name: string;
        categories: string[];
        flow_json: string;
    }): Promise<{
        id: string;
    }>;
    actualizarFlowMeta(config: WaConfig, metaFlowId: string, flowJson: string): Promise<void>;
    publicarFlowMeta(config: WaConfig, metaFlowId: string): Promise<void>;
    obtenerEstadoFlowMeta(config: WaConfig, metaFlowId: string): Promise<{
        status: string;
        validation_errors?: any[];
    }>;
    obtenerPreviewFlowMeta(config: WaConfig, metaFlowId: string): Promise<{
        preview_url: string;
    }>;
    eliminarFlowMeta(config: WaConfig, metaFlowId: string): Promise<void>;
    deprecarFlowMeta(config: WaConfig, metaFlowId: string): Promise<void>;
    enviarFlow(to: string, metaFlowId: string, flowToken: string, cta: string, cuerpo: string, screenId: string, config: WaConfig): Promise<void>;
    enviarTexto(to: string, text: string, config: WaConfig): Promise<any>;
    descargarMedia(mediaId: string, config: WaConfig): Promise<{
        buffer: Buffer;
        mimeType: string;
    }>;
    enviarImagen(to: string, imageUrl: string, caption: string, config: WaConfig): Promise<void>;
    enviarDocumento(to: string, documentUrl: string, filename: string, caption: string, config: WaConfig): Promise<void>;
    enviarAudio(to: string, audioUrl: string, config: WaConfig): Promise<void>;
    enviarVideo(to: string, videoUrl: string, caption: string, config: WaConfig): Promise<void>;
    enviarBotones(to: string, cuerpo: string, opciones: Array<{
        id: string;
        titulo: string;
    }>, config: WaConfig): Promise<void>;
    enviarLista(to: string, cuerpo: string, botonTexto: string, opciones: Array<{
        id: string;
        titulo: string;
    }>, config: WaConfig): Promise<void>;
    enviarBotonLink(to: string, cuerpo: string, textoBoton: string, url: string, config: WaConfig): Promise<void>;
    enviarSolicitudUbicacion(to: string, cuerpo: string, config: WaConfig): Promise<void>;
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
