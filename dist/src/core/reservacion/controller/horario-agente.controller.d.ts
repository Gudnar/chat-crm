import { HorarioAgenteService } from '../service/horario-agente.service';
import { CreateHorarioAgenteDto } from '../dto/horario-agente.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class HorarioAgenteController {
    private readonly horarioAgenteService;
    constructor(horarioAgenteService: HorarioAgenteService);
    listar(agenteId: string, req: any): Promise<SuccessResponseDto>;
    crear(dto: CreateHorarioAgenteDto, req: any): Promise<SuccessResponseDto>;
    eliminar(id: string, req: any): Promise<SuccessResponseDto>;
}
