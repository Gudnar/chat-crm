import { Repository } from 'typeorm';
import { Conversacion } from '../entity/conversacion.entity';
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service';
import { ClienteService } from '../../cliente/service/cliente.service';
import { BaseService } from '../../../common/base/base-service';
export interface CalificacionConfig {
    prompt?: string;
    criterios?: any[];
    umbrales?: {
        hot: {
            min: number;
            max: number;
        };
        warm: {
            min: number;
            max: number;
        };
        cold: {
            min: number;
            max: number;
        };
    };
}
export declare class CalificacionService extends BaseService {
    private readonly convRepo;
    private readonly confClienteService;
    private readonly clienteService;
    constructor(convRepo: Repository<Conversacion>, confClienteService: ConfiguracionClienteService, clienteService: ClienteService);
    cronCalificar(): Promise<void>;
    calificarLote(clienteId: string): Promise<{
        calificadas: number;
        errores: number;
    }>;
    calificarConIA(conversacionId: string, clienteId: string): Promise<{
        score: number;
        motivo: string;
    }>;
    obtenerConfig(clienteId: string): Promise<CalificacionConfig>;
    guardarConfig(clienteId: string, config: CalificacionConfig, userId: string): Promise<void>;
}
