import { ServicioAgenteService } from '../service/servicio-agente.service';
import { CreateServicioAgenteDto, UpdateServicioAgenteDto } from '../dto/servicio-agente.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class ServicioAgenteController {
    private readonly servicioAgenteService;
    constructor(servicioAgenteService: ServicioAgenteService);
    listar(agenteId: string, req: any): Promise<SuccessResponseDto>;
    obtener(id: string, req: any): Promise<SuccessResponseDto>;
    crear(dto: CreateServicioAgenteDto, req: any): Promise<SuccessResponseDto>;
    actualizar(id: string, dto: UpdateServicioAgenteDto, req: any): Promise<SuccessResponseDto>;
    eliminar(id: string, req: any): Promise<SuccessResponseDto>;
}
