import { Cliente } from '../../cliente/entity/cliente.entity';
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class Conversacion extends AuditoriaEntity {
    id: string;
    agenteId: string | null;
    contacto: string;
    canal: string;
    estadoConversacion: string;
    score: number;
    mensajes: Array<{
        role: string;
        content: string;
        timestamp: string;
    }>;
    totalMensajes: number;
    escalado: boolean;
    etiquetas: string[];
    motivoScore?: string;
    ultimaCalificacion?: Date;
    notas?: string;
    resolucion?: string;
    clienteId: string;
    cliente: Cliente;
    constructor(data?: Partial<Conversacion>);
}
