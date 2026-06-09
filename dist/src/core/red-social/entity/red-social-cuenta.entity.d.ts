import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
import { Cliente } from '../../cliente/entity/cliente.entity';
export declare class RedSocialCuenta extends AuditoriaEntity {
    id: string;
    plataforma: string;
    nombre: string;
    pageId: string;
    accessToken?: string;
    appSecret?: string;
    verifyToken?: string;
    agenteId?: string;
    enabled: boolean;
    clienteId: string;
    cliente: Cliente;
    constructor(data?: Partial<RedSocialCuenta>);
}
