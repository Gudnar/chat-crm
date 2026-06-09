import { Repository } from 'typeorm';
import { ConfiguracionCliente } from '../entity/configuracion-cliente.entity';
import { SetConfiguracionClienteDto } from '../dto/configuracion-cliente.dto';
import { BaseService } from '../../../common/base/base-service';
export declare class ConfiguracionClienteService extends BaseService {
    private readonly repo;
    constructor(repo: Repository<ConfiguracionCliente>);
    listar(clienteId: string): Promise<Partial<ConfiguracionCliente>[]>;
    obtenerPorClave(clienteId: string, clave: string): Promise<ConfiguracionCliente | null>;
    set(clienteId: string, dto: SetConfiguracionClienteDto, usuarioCreacion: string): Promise<ConfiguracionCliente>;
    eliminar(clienteId: string, clave: string, usuarioModificacion: string): Promise<void>;
    resolverClientePorPhoneNumberId(phoneNumberId: string): Promise<string | null>;
    resolverClientePorVerifyToken(verifyToken: string): Promise<string | null>;
}
