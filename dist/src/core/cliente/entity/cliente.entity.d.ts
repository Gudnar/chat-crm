import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
import { ConfiguracionCliente } from './configuracion-cliente.entity';
export declare class Cliente extends AuditoriaEntity {
    id: string;
    nombre: string;
    slug: string;
    logoUrl?: string;
    correoContacto?: string;
    telefono?: string;
    plan: string;
    activo: boolean;
    diasAtencion: string[];
    horaInicioAtencion?: string;
    horaFinAtencion?: string;
    horarios: {
        dia: string;
        franjas: {
            inicio: string;
            fin: string;
        }[];
    }[];
    servicios: string[];
    metadatos?: Record<string, any>;
    configuraciones: ConfiguracionCliente[];
    constructor(data?: Partial<Cliente>);
}
