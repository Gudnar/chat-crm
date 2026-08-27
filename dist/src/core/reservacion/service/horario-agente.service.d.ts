import { Repository } from 'typeorm';
import { HorarioAgente } from '../entity/horario-agente.entity';
import { CreateHorarioAgenteDto } from '../dto/horario-agente.dto';
import { ExcepcionHorarioAgenteService } from './excepcion-horario-agente.service';
import { BaseService } from '../../../common/base/base-service';
export declare class HorarioAgenteService extends BaseService {
    private readonly horarioAgenteRepository;
    private readonly excepcionHorarioAgenteService;
    constructor(horarioAgenteRepository: Repository<HorarioAgente>, excepcionHorarioAgenteService: ExcepcionHorarioAgenteService);
    listarPorAgente(agenteId: string, clienteId: string): Promise<HorarioAgente[]>;
    crear(dto: CreateHorarioAgenteDto, usuarioCreacion: string, clienteId: string): Promise<HorarioAgente>;
    eliminar(id: string, usuarioModificacion: string, clienteId: string): Promise<void>;
    generarSlotsBase(agenteId: string, clienteId: string, fecha: string, duracionMinutos: number): Promise<string[]>;
    private aMinutos;
    private aHHmm;
}
