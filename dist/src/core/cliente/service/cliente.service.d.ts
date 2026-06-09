import { Repository, DataSource } from 'typeorm';
import { Cliente } from '../entity/cliente.entity';
import { CreateClienteDto, UpdateClienteDto } from '../dto/cliente.dto';
import { BaseService } from '../../../common/base/base-service';
export interface ResumenCliente {
    agentes: number;
    conversaciones: number;
    usuarios: number;
    cuentasRedesSociales: number;
    configuraciones: number;
}
export declare class ClienteService extends BaseService {
    private readonly clienteRepository;
    private readonly dataSource;
    constructor(clienteRepository: Repository<Cliente>, dataSource: DataSource);
    listar(): Promise<Cliente[]>;
    obtener(id: string): Promise<Cliente>;
    obtenerPorSlug(slug: string): Promise<Cliente>;
    crear(dto: CreateClienteDto, usuarioCreacion: string): Promise<Cliente>;
    actualizar(id: string, dto: UpdateClienteDto, usuarioModificacion: string): Promise<Cliente>;
    eliminar(id: string, usuarioModificacion: string): Promise<void>;
    resumen(id: string): Promise<ResumenCliente>;
}
