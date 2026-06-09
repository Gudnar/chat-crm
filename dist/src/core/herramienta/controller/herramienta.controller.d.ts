import { HerramientaService } from '../service/herramienta.service';
import { AgenteService } from '../../agente/service/agente.service';
import { CreateHerramientaDto, UpdateHerramientaDto } from '../dto/create-herramienta.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class HerramientaController {
    private readonly herramientaService;
    private readonly agenteService;
    constructor(herramientaService: HerramientaService, agenteService: AgenteService);
    listar(agenteId: string, req: any): Promise<SuccessResponseDto>;
    crear(dto: CreateHerramientaDto, req: any): Promise<SuccessResponseDto>;
    actualizar(id: string, dto: UpdateHerramientaDto, req: any): Promise<SuccessResponseDto>;
    eliminar(id: string, req: any): Promise<SuccessResponseDto>;
}
