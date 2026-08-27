/// <reference types="node" />
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service';
export declare class TranscripcionAudioService {
    private readonly confClienteService;
    private readonly logger;
    constructor(confClienteService: ConfiguracionClienteService);
    transcribir(buffer: Buffer, mimeType: string, clienteId: string): Promise<string | null>;
}
