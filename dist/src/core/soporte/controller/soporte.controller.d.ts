import { SoporteService } from '../service/soporte.service';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class SoporteController {
    private readonly soporteService;
    constructor(soporteService: SoporteService);
    listar(req: any): Promise<SuccessResponseDto>;
    estadisticas(req: any): Promise<SuccessResponseDto>;
    obtener(id: string, req: any): Promise<SuccessResponseDto>;
    crear(body: any, req: any): Promise<SuccessResponseDto>;
    cambiarEstado(id: string, estadoCaso: string, req: any): Promise<SuccessResponseDto>;
    actualizar(id: string, body: any, req: any): Promise<SuccessResponseDto>;
    agregarNota(id: string, nota: string, req: any): Promise<SuccessResponseDto>;
}
