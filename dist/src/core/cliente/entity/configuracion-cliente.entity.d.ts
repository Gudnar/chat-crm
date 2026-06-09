import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
import { Cliente } from './cliente.entity';
export declare class ConfiguracionCliente extends AuditoriaEntity {
    id: string;
    clienteId: string;
    clave: string;
    valor?: string;
    tipo: string;
    descripcion?: string;
    esSecreto: boolean;
    cliente: Cliente;
    constructor(data?: Partial<ConfiguracionCliente>);
}
