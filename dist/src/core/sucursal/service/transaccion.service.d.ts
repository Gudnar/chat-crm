import { Repository } from 'typeorm';
import { Transaccion } from '../entity/transaccion.entity';
import { CreateTransaccionDto } from '../dto/transaccion.dto';
import { BaseService } from '../../../common/base/base-service';
export declare class TransaccionService extends BaseService {
    private readonly repo;
    constructor(repo: Repository<Transaccion>);
    listarPorSucursal(sucursalId: string, desde?: Date, hasta?: Date): Promise<Transaccion[]>;
    listarPorCaja(cajaSucursalId: string): Promise<Transaccion[]>;
    crear(clienteId: string, sucursalId: string, dto: CreateTransaccionDto, usuarioCreacion: string): Promise<Transaccion>;
    calcularTotalPorCaja(cajaSucursalId: string): Promise<number>;
    calcularEgresosPorCaja(cajaSucursalId: string): Promise<number>;
}
