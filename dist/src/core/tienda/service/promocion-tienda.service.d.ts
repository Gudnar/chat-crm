import { Repository } from 'typeorm';
import { PromocionTienda } from '../entity/promocion-tienda.entity';
import { CreatePromocionTiendaDto, UpdatePromocionTiendaDto } from '../dto/promocion-tienda.dto';
import { BaseService } from '../../../common/base/base-service';
export declare class PromocionTiendaService extends BaseService {
    private readonly repo;
    constructor(repo: Repository<PromocionTienda>);
    listar(clienteId: string): Promise<PromocionTienda[]>;
    obtener(id: string, clienteId: string): Promise<PromocionTienda>;
    obtenerVigente(articuloId: string, clienteId: string, sucursalId?: string): Promise<PromocionTienda | null>;
    obtenerVigentesPorCliente(clienteId: string, sucursalId?: string): Promise<PromocionTienda[]>;
    crear(dto: CreatePromocionTiendaDto, clienteId: string, usuarioCreacion: string): Promise<PromocionTienda>;
    actualizar(id: string, dto: UpdatePromocionTiendaDto, clienteId: string, usuarioModificacion: string): Promise<PromocionTienda>;
    eliminar(id: string, clienteId: string, usuarioModificacion: string): Promise<void>;
}
