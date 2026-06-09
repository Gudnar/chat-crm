import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
import { CampanaRemarketing } from './campana-remarketing.entity';
import { Cliente } from '../../cliente/entity/cliente.entity';
export declare class EnvioRemarketing extends AuditoriaEntity {
    id: string;
    campanaId: string;
    conversacionId: string;
    contacto: string;
    scoreAlEnvio: number;
    estadoEnvio: string;
    mensajeEnviado?: string;
    enviadoEn?: Date;
    error?: string;
    clienteId: string;
    campana: CampanaRemarketing;
    cliente: Cliente;
    constructor(data?: Partial<EnvioRemarketing>);
}
