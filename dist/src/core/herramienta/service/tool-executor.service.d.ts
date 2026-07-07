import { ConversacionService } from '../../conversacion/service/conversacion.service';
import { ProductoService } from '../../producto/service/producto.service';
export interface ToolContexto {
    conversacionId: string;
    clienteId: string;
    agenteId: string;
}
export interface ToolResult {
    texto: string;
    imagenes?: string[];
}
export declare class ToolExecutorService {
    private readonly conversacionService;
    private readonly productoService;
    private readonly logger;
    constructor(conversacionService: ConversacionService, productoService: ProductoService);
    ejecutar(nombre: string, input: Record<string, any>, contexto: ToolContexto): Promise<ToolResult>;
    private calificarLead;
    private cambiarEstado;
    private escalarAgente;
    private crearNota;
    private buscarProducto;
}
