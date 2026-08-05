import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class Reserva extends AuditoriaEntity {
    id: string;
    codigoReserva: string;
    agenteId: string;
    tipoAgenteReserva: string;
    servicioAgenteId?: string;
    clienteId: string;
    conversacionId?: string;
    contactoNombre: string;
    contactoTelefono?: string;
    contactoEmail?: string;
    fechaInicio: Date;
    fechaFin: Date;
    duracionMinutos: number;
    titulo: string;
    descripcion?: string;
    tipoServicio?: string;
    estadoReserva: string;
    notasInternas?: string;
    resultado?: string;
    recordatorioEnviado: boolean;
    constructor(data?: Partial<Reserva>);
}
