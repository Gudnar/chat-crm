import { Repository } from 'typeorm';
import { ArticuloTienda } from '../entity/articulo-tienda.entity';
import { CarritoTienda } from '../entity/carrito-tienda.entity';
import { CategoriaTienda } from '../entity/categoria-tienda.entity';
import { ArticuloSucursal } from '../entity/articulo-sucursal.entity';
import { Sucursal } from '../../sucursal/entity/sucursal.entity';
import { AgregarItemCarritoDto, ActualizarItemCarritoDto } from '../dto/carrito-tienda.dto';
import { PromocionTiendaService } from './promocion-tienda.service';
import { ClienteService } from '../../cliente/service/cliente.service';
import { ConversacionService } from '../../conversacion/service/conversacion.service';
import { WhatsappService } from '../../whatsapp/service/whatsapp.service';
import { BaseService } from '../../../common/base/base-service';
export declare class TiendaPublicaService extends BaseService {
    private readonly articuloRepo;
    private readonly carritoRepo;
    private readonly categoriaRepo;
    private readonly sucursalRepo;
    private readonly articuloSucursalRepo;
    private readonly promocionService;
    private readonly clienteService;
    private readonly conversacionService;
    private readonly waService;
    constructor(articuloRepo: Repository<ArticuloTienda>, carritoRepo: Repository<CarritoTienda>, categoriaRepo: Repository<CategoriaTienda>, sucursalRepo: Repository<Sucursal>, articuloSucursalRepo: Repository<ArticuloSucursal>, promocionService: PromocionTiendaService, clienteService: ClienteService, conversacionService: ConversacionService, waService: WhatsappService);
    obtenerTienda(slug: string, sucursalId?: string): Promise<{
        categorias: {
            nombre: string;
            imagenUrl: string | null;
        }[];
        sucursales: {
            id: string;
            nombre: string;
            direccion: string | null;
            latitud: number | null;
            longitud: number | null;
            aceptaPagoQr: boolean;
            aceptaPagoEfectivo: boolean;
            qrImagenUrl: string | null;
        }[];
        articulos: any[];
        abierto: boolean | null;
        horaCierre: string | null;
        nombre: string;
        slug: string;
        logoUrl: string | null;
        portadaUrl: string | null;
        colorPrimario: string;
    }>;
    private calcularEstadoHorario;
    private resolverClienteTiendaActiva;
    private resolverCarrito;
    crearSesion(slug: string): Promise<{
        token: string;
    }>;
    elegirSucursal(slug: string, token: string, sucursalId: string): Promise<CarritoTienda>;
    abrirParaConversacion(clienteId: string, conversacionId: string, contactoTelefono: string): Promise<{
        ok: true;
        token: string;
        slug: string;
    } | {
        ok: false;
        error: string;
    }>;
    obtenerCarrito(slug: string, token: string): Promise<CarritoTienda>;
    agregarItem(slug: string, token: string, dto: AgregarItemCarritoDto): Promise<CarritoTienda>;
    actualizarItem(slug: string, token: string, itemId: string, dto: ActualizarItemCarritoDto): Promise<CarritoTienda>;
    eliminarItem(slug: string, token: string, itemId: string): Promise<CarritoTienda>;
    confirmar(slug: string, token: string, metodoPago?: string): Promise<CarritoTienda>;
    private validarMetodoPago;
    private generarCodigoPedido;
    private descontarStock;
    private validarDisponibilidadSucursal;
    private construirItem;
    private validarGruposObligatorios;
    private recalcularTotal;
    private formatearPedido;
    private avisarPorWhatsapp;
}
