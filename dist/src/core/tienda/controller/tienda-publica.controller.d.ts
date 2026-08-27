import { TiendaPublicaService } from '../service/tienda-publica.service';
import { AgregarItemCarritoDto, ActualizarItemCarritoDto, ElegirSucursalDto, ConfirmarPedidoDto } from '../dto/carrito-tienda.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class TiendaPublicaController {
    private readonly tiendaPublicaService;
    constructor(tiendaPublicaService: TiendaPublicaService);
    obtenerTienda(slug: string, sucursalId?: string): Promise<SuccessResponseDto>;
    crearSesion(slug: string): Promise<SuccessResponseDto>;
    elegirSucursal(slug: string, token: string, dto: ElegirSucursalDto): Promise<SuccessResponseDto>;
    obtenerCarrito(slug: string, token: string): Promise<SuccessResponseDto>;
    agregarItem(slug: string, token: string, dto: AgregarItemCarritoDto): Promise<SuccessResponseDto>;
    actualizarItem(slug: string, token: string, itemId: string, dto: ActualizarItemCarritoDto): Promise<SuccessResponseDto>;
    eliminarItem(slug: string, token: string, itemId: string): Promise<SuccessResponseDto>;
    confirmar(slug: string, token: string, dto: ConfirmarPedidoDto): Promise<SuccessResponseDto>;
}
