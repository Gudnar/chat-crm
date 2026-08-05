import { Cliente } from '../../cliente/entity/cliente.entity';
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export declare class Conversacion extends AuditoriaEntity {
    id: string;
    agenteId: string | null;
    agenteHumanoId: string | null;
    tipoAgenteAsignado?: string | null;
    fechaAsignacionHumano?: Date | null;
    contacto: string;
    canal: string;
    estadoConversacion: string;
    score: number;
    mensajes: Array<{
        role: string;
        content: string;
        timestamp: string;
        adjunto?: {
            url: string;
            tipo: string;
            nombre?: string;
        };
        interactivo?: {
            pregunta: string;
            botones: Array<{
                id: string;
                titulo: string;
            }>;
        };
        enlace?: {
            texto: string;
            url: string;
        };
        pidioUbicacion?: boolean;
        ubicacion?: {
            latitud: number;
            longitud: number;
            nombre?: string;
            direccion?: string;
        };
        flow?: {
            metaFlowId: string;
            flowToken: string;
            cta: string;
        };
        respuestaFlow?: {
            nombre: string;
            respuestas: Record<string, string>;
        };
    }>;
    totalMensajes: number;
    ultimoRecordatorioEn?: Date | null;
    escalado: boolean;
    etiquetas: string[];
    recursosEnviados: string[];
    motivoScore?: string;
    ultimaCalificacion?: Date;
    notas?: string;
    resolucion?: string;
    clienteId: string;
    cliente: Cliente;
    constructor(data?: Partial<Conversacion>);
}
