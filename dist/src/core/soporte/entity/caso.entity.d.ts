import { Cliente } from '../../cliente/entity/cliente.entity';
import { Conversacion } from '../../conversacion/entity/conversacion.entity';
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class CasoSoporte extends AuditoriaEntity {
    id: string;
    numeroCaso: string;
    titulo: string;
    descripcion: string;
    estadoCaso: string;
    prioridad: string;
    categoria?: string;
    conversacionId?: string;
    conversacion: Conversacion;
    clienteId: string;
    cliente: Cliente;
    nombreContacto: string;
    emailContacto?: string;
    telefonoContacto?: string;
    asignadoA?: string;
    historial: Array<{
        timestamp: string;
        accion: string;
        usuario: string;
        detalles: string;
    }>;
    fechaResolucion?: Date;
    constructor(data?: Partial<CasoSoporte>);
}
