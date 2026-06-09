import { AgenteService } from '../service/agente.service';
import { CreateAgenteDto, UpdateAgenteDto } from '../dto/create-agente.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class AgenteController {
    private readonly agenteService;
    constructor(agenteService: AgenteService);
    listar(req: any): Promise<SuccessResponseDto>;
    obtener(id: string, req: any): Promise<SuccessResponseDto>;
    crear(dto: CreateAgenteDto, req: any): Promise<SuccessResponseDto>;
    actualizar(id: string, dto: UpdateAgenteDto, req: any): Promise<SuccessResponseDto>;
    eliminar(id: string, req: any): Promise<SuccessResponseDto>;
    testConAgente(id: string, mensaje: string, historial: {
        role: 'user' | 'assistant';
        content: string;
    }[] | undefined, req: any): Promise<SuccessResponseDto>;
}
