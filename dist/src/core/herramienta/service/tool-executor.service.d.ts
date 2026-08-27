import { ConfigService } from '@nestjs/config';
import { ConversacionService } from '../../conversacion/service/conversacion.service';
import { ProductoService } from '../../producto/service/producto.service';
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service';
import { RecursoService } from '../../recurso/service/recurso.service';
import { ReservacionService } from '../../reservacion/service/reservacion.service';
import { FlowWhatsappService } from '../../whatsapp/service/flow-whatsapp.service';
import { TiendaPublicaService } from '../../tienda/service/tienda-publica.service';
import { PedidoService } from '../../sucursal/service/pedido.service';
import { InventarioSucursalService } from '../../sucursal/service/inventario-sucursal.service';
import { SucursalService } from '../../sucursal/service/sucursal.service';
import { ClienteFinalService } from '../../sucursal/service/cliente-final.service';
export interface ToolContexto {
    conversacionId: string;
    clienteId: string;
    agenteId: string;
}
export interface ToolDocumento {
    url: string;
    filename: string;
}
export interface ToolOpciones {
    pregunta: string;
    botones: Array<{
        id: string;
        titulo: string;
    }>;
}
export interface ToolBotonLink {
    mensaje: string;
    textoBoton: string;
    url: string;
}
export interface ToolSolicitudUbicacion {
    mensaje: string;
}
export interface ToolFlow {
    mensaje: string;
    metaFlowId: string;
    flowToken: string;
    cta: string;
    screenId: string;
}
export interface ToolResult {
    texto: string;
    imagenes?: string[];
    documentos?: ToolDocumento[];
    audios?: string[];
    videos?: string[];
    opciones?: ToolOpciones;
    botonLink?: ToolBotonLink;
    solicitudUbicacion?: ToolSolicitudUbicacion;
    flow?: ToolFlow;
}
export declare class ToolExecutorService {
    private readonly conversacionService;
    private readonly productoService;
    private readonly confClienteService;
    private readonly recursoService;
    private readonly reservacionService;
    private readonly flowWhatsappService;
    private readonly tiendaPublicaService;
    private readonly pedidoService;
    private readonly inventarioService;
    private readonly sucursalService;
    private readonly clienteFinalService;
    private readonly configService;
    private readonly logger;
    constructor(conversacionService: ConversacionService, productoService: ProductoService, confClienteService: ConfiguracionClienteService, recursoService: RecursoService, reservacionService: ReservacionService, flowWhatsappService: FlowWhatsappService, tiendaPublicaService: TiendaPublicaService, pedidoService: PedidoService, inventarioService: InventarioSucursalService, sucursalService: SucursalService, clienteFinalService: ClienteFinalService, configService: ConfigService);
    ejecutar(nombre: string, input: Record<string, any>, contexto: ToolContexto): Promise<ToolResult>;
    private calificarLead;
    private cambiarEstado;
    private escalarAgente;
    private preguntarOpciones;
    private enviarBotonLink;
    private solicitarUbicacion;
    private iniciarFlow;
    private abrirTienda;
    private crearNota;
    private buscarProducto;
    private reservarProducto;
    private consultarDisponibilidad;
    private agendarCita;
    private enviarCatalogo;
    private enviarRecurso;
    private crearPedido;
    private consultarStockSucursal;
    private consultarEstadoPedido;
    private nombreArchivo;
}
