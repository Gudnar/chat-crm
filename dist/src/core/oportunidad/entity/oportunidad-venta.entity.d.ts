import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
import { Cliente } from '../../cliente/entity/cliente.entity';
import { Conversacion } from '../../conversacion/entity/conversacion.entity';
export interface HistorialOportunidad {
    timestamp: string;
    accion: string;
    usuarioId: string;
    usuarioNombre: string;
    detalles: string;
}
export declare class OportunidadVenta extends AuditoriaEntity {
    id: string;
    numeroOportunidad: string;
    estadoOportunidad: string;
    prioridad: string;
    montoEstimado?: number | null;
    moneda: string;
    contactoNombre: string;
    contactoTelefono?: string | null;
    contactoEmail?: string | null;
    empresa?: string | null;
    origen: string;
    productoInteres?: string | null;
    conversacionId?: string | null;
    fechaPrimerContacto?: Date | null;
    conversacion?: Conversacion;
    asignadoA?: string | null;
    asignadoNombre?: string | null;
    proximaAccion?: string | null;
    proximaAccionFecha?: Date | null;
    motivoCierre?: string | null;
    fechaCierre?: Date | null;
    notas?: string | null;
    historial: HistorialOportunidad[];
    clienteId: string;
    cliente: Cliente;
    constructor(data?: Partial<OportunidadVenta>);
}
