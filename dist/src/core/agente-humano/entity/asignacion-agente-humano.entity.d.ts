import { Conversacion } from '../../conversacion/entity/conversacion.entity';
import { Agente } from '../../agente/entity/agente.entity';
import { Cliente } from '../../cliente/entity/cliente.entity';
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class AsignacionAgenteHumano extends AuditoriaEntity {
    id: string;
    conversacionId: string;
    conversacion: Conversacion;
    agenteHumanoId: string;
    agenteHumano: Agente;
    asignadoPor: string;
    fechaAsignacion: Date;
    fechaCierre?: Date | null;
    razonAsignacion?: string;
    fueEscalada: boolean;
    estadoAsignacion: string;
    tiempoAtencionSegundos?: number | null;
    clienteId: string;
    cliente: Cliente;
    constructor(data?: Partial<AsignacionAgenteHumano>);
}
