import { Repository } from 'typeorm';
import { Agente } from '../entity/agente.entity';
import { CreateAgenteDto, UpdateAgenteDto } from '../dto/create-agente.dto';
import { BaseService } from '../../../common/base/base-service';
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service';
export declare class AgenteService extends BaseService {
    private readonly agenteRepository;
    private readonly configuracionClienteService;
    constructor(agenteRepository: Repository<Agente>, configuracionClienteService: ConfiguracionClienteService);
    listar(clienteId: string): Promise<Agente[]>;
    obtener(id: string, clienteId: string): Promise<Agente>;
    crear(dto: CreateAgenteDto, usuarioCreacion: string, clienteId: string): Promise<Agente>;
    actualizar(id: string, dto: UpdateAgenteDto, usuarioModificacion: string, clienteId: string): Promise<Agente>;
    eliminar(id: string, usuarioModificacion: string, clienteId: string): Promise<void>;
    incrementarContadores(id: string, mensajes?: number): Promise<void>;
    testConAgente(id: string, mensaje: string, historial: {
        role: 'user' | 'assistant';
        content: string;
    }[] | undefined, clienteId: string): Promise<{
        respuesta: string;
        modelo: string;
    }>;
}
