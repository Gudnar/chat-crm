import { Repository } from 'typeorm';
import { ExcepcionHorarioAgente } from '../entity/excepcion-horario-agente.entity';
import { CreateExcepcionHorarioAgenteDto, UpdateExcepcionHorarioAgenteDto } from '../dto/excepcion-horario-agente.dto';
import { AgenteService } from '../../agente/service/agente.service';
import { BaseService } from '../../../common/base/base-service';
export declare class ExcepcionHorarioAgenteService extends BaseService {
    private readonly excepcionRepository;
    private readonly agenteService;
    constructor(excepcionRepository: Repository<ExcepcionHorarioAgente>, agenteService: AgenteService);
    listar(clienteId: string, filtros?: {
        agenteId?: string;
    }): Promise<ExcepcionHorarioAgente[]>;
    listarEnRango(clienteId: string, desde: string, hasta: string, agenteId?: string): Promise<ExcepcionHorarioAgente[]>;
    estaBloqueada(agenteId: string, clienteId: string, fecha: string): Promise<{
        bloqueada: boolean;
        motivo?: string;
    }>;
    obtenerBloqueosParciales(agenteId: string, clienteId: string, fecha: string): Promise<{
        horaInicio: string;
        horaFin: string;
        motivo: string;
    }[]>;
    upsertDesdeGoogle(datos: {
        agenteId: string;
        clienteId: string;
        fecha: string;
        horaInicio: string;
        horaFin: string;
        motivo: string;
        googleEventId: string;
        usuarioSistema: string;
    }): Promise<void>;
    eliminarPorGoogleEventId(agenteId: string, clienteId: string, googleEventId: string, usuarioModificacion: string): Promise<void>;
    crear(dto: CreateExcepcionHorarioAgenteDto, usuarioCreacion: string, clienteId: string): Promise<ExcepcionHorarioAgente>;
    actualizar(id: string, dto: UpdateExcepcionHorarioAgenteDto, usuarioModificacion: string, clienteId: string): Promise<ExcepcionHorarioAgente>;
    eliminar(id: string, usuarioModificacion: string, clienteId: string): Promise<void>;
    private obtener;
    private validarAgenteHumano;
}
