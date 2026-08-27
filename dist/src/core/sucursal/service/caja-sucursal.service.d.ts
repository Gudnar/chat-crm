import { Repository } from 'typeorm';
import { CajaSucursal } from '../entity/caja-sucursal.entity';
import { AbrirCajaDto, CerrarCajaDto } from '../dto/caja-sucursal.dto';
import { TransaccionService } from './transaccion.service';
import { BaseService } from '../../../common/base/base-service';
export declare class CajaSucursalService extends BaseService {
    private readonly repo;
    private readonly transaccionService;
    constructor(repo: Repository<CajaSucursal>, transaccionService: TransaccionService);
    obtenerCajaAbierta(sucursalId: string): Promise<CajaSucursal | null>;
    abrirCaja(clienteId: string, sucursalId: string, usuarioId: string, dto: AbrirCajaDto, usuarioCreacion: string): Promise<CajaSucursal>;
    cerrarCaja(cajaId: string, sucursalId: string, clienteId: string, dto: CerrarCajaDto, usuarioModificacion: string): Promise<CajaSucursal>;
    listarCajasPorSucursal(sucursalId: string, estadoCaja?: 'abierta' | 'cerrada'): Promise<CajaSucursal[]>;
}
