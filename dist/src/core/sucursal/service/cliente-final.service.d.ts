import { Repository } from 'typeorm';
import { ClienteFinal } from '../entity/cliente-final.entity';
import { CreateClienteFinalDto, UpdateClienteFinalDto } from '../dto/cliente-final.dto';
import { BaseService } from '../../../common/base/base-service';
export declare class ClienteFinalService extends BaseService {
    private readonly repo;
    constructor(repo: Repository<ClienteFinal>);
    listarPorCliente(clienteId: string, sucursalId?: string): Promise<ClienteFinal[]>;
    obtener(id: string, clienteId: string): Promise<ClienteFinal>;
    buscarPorTelefono(clienteId: string, telefono: string): Promise<ClienteFinal | null>;
    crear(clienteId: string, dto: CreateClienteFinalDto, usuarioCreacion: string): Promise<ClienteFinal>;
    actualizar(id: string, clienteId: string, dto: UpdateClienteFinalDto, usuarioModificacion: string): Promise<ClienteFinal>;
    eliminar(id: string, clienteId: string, usuarioModificacion: string): Promise<void>;
    registrarCompra(id: string, clienteId: string, monto: number, usuarioModificacion: string): Promise<ClienteFinal>;
}
