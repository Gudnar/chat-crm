import { Repository } from 'typeorm';
import { Sucursal } from '../entity/sucursal.entity';
import { CreateSucursalDto, UpdateSucursalDto } from '../dto/create-sucursal.dto';
import { BaseService } from '../../../common/base/base-service';
export declare class SucursalService extends BaseService {
    private readonly repo;
    constructor(repo: Repository<Sucursal>);
    listar(clienteId: string, soloActivas?: boolean): Promise<Sucursal[]>;
    obtener(id: string, clienteId: string): Promise<Sucursal>;
    crear(dto: CreateSucursalDto, clienteId: string, usuarioCreacion: string): Promise<Sucursal>;
    actualizar(id: string, dto: UpdateSucursalDto, clienteId: string, usuarioModificacion: string): Promise<Sucursal>;
    eliminar(id: string, clienteId: string, usuarioModificacion: string): Promise<void>;
    resumen(id: string, clienteId: string): Promise<{
        sucursal: Sucursal;
        pedidosHoy: number;
        stockBajo: number;
        cajaAbierta: boolean;
    }>;
    setImagenQr(id: string, url: string, clienteId: string, usuarioModificacion: string): Promise<Sucursal>;
}
