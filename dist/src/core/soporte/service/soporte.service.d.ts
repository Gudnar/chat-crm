import { Repository } from 'typeorm';
import { CasoSoporte } from '../entity/caso.entity';
import { BaseService } from '../../../common/base/base-service';
export declare class SoporteService extends BaseService {
    private readonly casoRepository;
    constructor(casoRepository: Repository<CasoSoporte>);
    listar(clienteId: string): Promise<CasoSoporte[]>;
    obtener(id: string, clienteId: string): Promise<CasoSoporte>;
    crear(titulo: string, descripcion: string, nombreContacto: string, prioridad: string, categoria: string, clienteId: string, usuarioCreacion: string, conversacionId?: string): Promise<CasoSoporte>;
    actualizar(id: string, clienteId: string, updates: any): Promise<CasoSoporte>;
    cambiarEstado(id: string, clienteId: string, nuevoEstado: string, usuarioId: string): Promise<CasoSoporte>;
    agregarNota(id: string, clienteId: string, nota: string, usuarioId: string): Promise<CasoSoporte>;
    estadisticas(clienteId: string): Promise<any>;
}
