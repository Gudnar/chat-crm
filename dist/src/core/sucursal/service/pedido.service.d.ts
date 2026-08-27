import { Repository } from 'typeorm';
import { Pedido } from '../entity/pedido.entity';
import { CreatePedidoDto, UpdatePedidoEstadoDto, UpdatePedidoEstadoPagoDto } from '../dto/pedido.dto';
import { Sucursal } from '../entity/sucursal.entity';
import { BaseService } from '../../../common/base/base-service';
export declare class PedidoService extends BaseService {
    private readonly repo;
    private readonly sucursalRepo;
    constructor(repo: Repository<Pedido>, sucursalRepo: Repository<Sucursal>);
    listarPorSucursal(sucursalId: string, estadoPedido?: string): Promise<Pedido[]>;
    obtener(id: string, clienteId: string): Promise<Pedido>;
    obtenerPorCodigo(codigoPedido: string, clienteId: string): Promise<Pedido>;
    obtenerPorConversacion(conversacionId: string, clienteId: string): Promise<Pedido | null>;
    crear(clienteId: string, dto: CreatePedidoDto, usuarioCreacion: string): Promise<Pedido>;
    cambiarEstado(id: string, clienteId: string, dto: UpdatePedidoEstadoDto, usuarioModificacion: string): Promise<Pedido>;
    cambiarEstadoPago(id: string, clienteId: string, dto: UpdatePedidoEstadoPagoDto, usuarioModificacion: string): Promise<Pedido>;
    eliminar(id: string, clienteId: string, usuarioModificacion: string): Promise<void>;
}
