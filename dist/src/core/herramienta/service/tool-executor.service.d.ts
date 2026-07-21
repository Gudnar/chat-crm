import { ConversacionService } from '../../conversacion/service/conversacion.service';
import { ProductoService } from '../../producto/service/producto.service';
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service';
import { RecursoService } from '../../recurso/service/recurso.service';
export interface ToolContexto {
    conversacionId: string;
    clienteId: string;
    agenteId: string;
}
export interface ToolDocumento {
    url: string;
    filename: string;
}
export interface ToolResult {
    texto: string;
    imagenes?: string[];
    documentos?: ToolDocumento[];
    audios?: string[];
    videos?: string[];
}
export declare class ToolExecutorService {
    private readonly conversacionService;
    private readonly productoService;
    private readonly confClienteService;
    private readonly recursoService;
    private readonly logger;
    constructor(conversacionService: ConversacionService, productoService: ProductoService, confClienteService: ConfiguracionClienteService, recursoService: RecursoService);
    ejecutar(nombre: string, input: Record<string, any>, contexto: ToolContexto): Promise<ToolResult>;
    private calificarLead;
    private cambiarEstado;
    private escalarAgente;
    private crearNota;
    private buscarProducto;
    private enviarCatalogo;
    private enviarRecurso;
    private nombreArchivo;
}
