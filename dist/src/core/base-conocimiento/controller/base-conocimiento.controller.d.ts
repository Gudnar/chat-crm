import { BaseConocimientoService } from '../service/base-conocimiento.service';
import { AgenteService } from '../../agente/service/agente.service';
import { CreateBaseConocimientoDto, UpdateBaseConocimientoDto } from '../dto/create-base-conocimiento.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class BaseConocimientoController {
    private readonly baseConocimientoService;
    private readonly agenteService;
    constructor(baseConocimientoService: BaseConocimientoService, agenteService: AgenteService);
    listar(agenteId: string, req: any): Promise<SuccessResponseDto>;
    crear(agenteId: string, dto: CreateBaseConocimientoDto, req: any): Promise<SuccessResponseDto>;
    actualizar(agenteId: string, id: string, dto: UpdateBaseConocimientoDto, req: any): Promise<SuccessResponseDto>;
    eliminar(agenteId: string, id: string, req: any): Promise<SuccessResponseDto>;
}
