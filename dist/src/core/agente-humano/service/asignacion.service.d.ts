import { Repository } from 'typeorm';
import { Conversacion } from '../../conversacion/entity/conversacion.entity';
import { Agente } from '../../agente/entity/agente.entity';
import { AsignacionAgenteHumano } from '../entity/asignacion-agente-humano.entity';
import { AsignarConversacionDto, CerrarConversacionDto } from '../dto/agente-humano.dto';
import { AgenteHumanoService } from './agente-humano.service';
import { BaseService } from '../../../common/base/base-service';
export declare class AsignacionService extends BaseService {
    private readonly conversacionRepository;
    private readonly agenteRepository;
    private readonly asignacionRepository;
    private readonly agenteHumanoService;
    constructor(conversacionRepository: Repository<Conversacion>, agenteRepository: Repository<Agente>, asignacionRepository: Repository<AsignacionAgenteHumano>, agenteHumanoService: AgenteHumanoService);
    asignar(dto: AsignarConversacionDto, asignadoPor: string, clienteId: string): Promise<{
        conversacionId: string;
        agenteHumanoId: string;
        agenteNombre: string;
    }>;
    misConversaciones(agenteHumanoId: string, clienteId: string): Promise<Conversacion[]>;
    cerrar(conversacionId: string, dto: CerrarConversacionDto, actor: {
        agenteHumanoId?: string;
        usuarioId: string;
    }, clienteId: string): Promise<{
        conversacionId: string;
        estadoConversacion: string;
    }>;
    devolverAIa(conversacionId: string, actor: {
        agenteHumanoId?: string;
        usuarioId: string;
    }, clienteId: string): Promise<{
        conversacionId: string;
        tipoAgenteAsignado: string;
    }>;
    colaSinAsignar(clienteId: string): Promise<Conversacion[]>;
    asignacionAutomatica(asignadoPor: string, clienteId: string): Promise<{
        asignadas: number;
        mensaje: string;
        agentesUsados?: undefined;
    } | {
        asignadas: number;
        agentesUsados: number;
        mensaje?: undefined;
    }>;
}
