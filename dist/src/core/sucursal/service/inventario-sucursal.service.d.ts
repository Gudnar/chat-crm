import { Repository } from 'typeorm';
import { InventarioSucursal } from '../entity/inventario-sucursal.entity';
import { CreateInventarioSucursalDto, UpdateInventarioSucursalDto, AjustarStockDto } from '../dto/inventario-sucursal.dto';
import { BaseService } from '../../../common/base/base-service';
export declare class InventarioSucursalService extends BaseService {
    private readonly repo;
    constructor(repo: Repository<InventarioSucursal>);
    listarPorSucursal(sucursalId: string): Promise<InventarioSucursal[]>;
    obtenerPorProducto(productoId: string, sucursalId: string): Promise<InventarioSucursal>;
    crear(sucursalId: string, dto: CreateInventarioSucursalDto, usuarioCreacion: string): Promise<InventarioSucursal>;
    actualizar(id: string, sucursalId: string, dto: UpdateInventarioSucursalDto, usuarioModificacion: string): Promise<InventarioSucursal>;
    eliminar(id: string, sucursalId: string, usuarioModificacion: string): Promise<void>;
    ajustarStock(productoId: string, sucursalId: string, dto: AjustarStockDto, usuarioModificacion: string): Promise<InventarioSucursal>;
    listarStockBajo(sucursalId: string): Promise<InventarioSucursal[]>;
}
