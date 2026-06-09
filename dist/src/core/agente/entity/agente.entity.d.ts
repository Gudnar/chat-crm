import { Cliente } from '../../cliente/entity/cliente.entity';
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class Agente extends AuditoriaEntity {
    id: string;
    nombre: string;
    descripcion?: string;
    modelo: string;
    tono: string;
    idioma: string;
    maxTokens: number;
    systemPrompt?: string;
    modoOperacion: string;
    activo: boolean;
    avatar: string;
    color: string;
    totalConversaciones: number;
    totalMensajes: number;
    clienteId: string;
    cliente: Cliente;
    constructor(data?: Partial<Agente>);
}
