import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
import { Cliente } from '../../cliente/entity/cliente.entity';
export declare class RedSocialPost extends AuditoriaEntity {
    id: string;
    plataforma: string;
    postId: string;
    titulo: string;
    contenido?: string;
    imageUrl?: string;
    tipo?: string;
    likes: number;
    comentarios: number;
    compartidos: number;
    alcance: number;
    fechaPost?: Date;
    comentariosData?: Array<{
        id: string;
        message: string;
        fromName: string;
        fromId: string;
        createdTime: string;
    }>;
    agenteId?: string;
    cuentaId?: string;
    enabled: boolean;
    clienteId: string;
    cliente: Cliente;
    constructor(data?: Partial<RedSocialPost>);
}
