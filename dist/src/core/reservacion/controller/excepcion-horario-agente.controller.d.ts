import { ExcepcionHorarioAgenteService } from '../service/excepcion-horario-agente.service';
import { CreateExcepcionHorarioAgenteDto, UpdateExcepcionHorarioAgenteDto } from '../dto/excepcion-horario-agente.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
import { AgenteHumanoService } from '../../agente-humano/service/agente-humano.service';
export declare class ExcepcionHorarioAgenteController {
    private readonly excepcionService;
    private readonly agenteHumanoService;
    constructor(excepcionService: ExcepcionHorarioAgenteService, agenteHumanoService: AgenteHumanoService);
    listar(agenteId: string, req: any): Promise<SuccessResponseDto>;
    listarEnRango(desde: string, hasta: string, agenteId: string, req: any): Promise<SuccessResponseDto>;
    listarMias(desde: string, hasta: string, req: any): Promise<SuccessResponseDto>;
    crear(dto: CreateExcepcionHorarioAgenteDto, req: any): Promise<SuccessResponseDto>;
    actualizar(id: string, dto: UpdateExcepcionHorarioAgenteDto, req: any): Promise<SuccessResponseDto>;
    eliminar(id: string, req: any): Promise<SuccessResponseDto>;
    private clienteIdDe;
}
