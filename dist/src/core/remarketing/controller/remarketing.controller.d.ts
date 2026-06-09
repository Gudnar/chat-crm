import { RemarketingService } from '../service/remarketing.service';
import { CreateCampanaDto } from '../dto/campana.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class RemarketingController {
    private readonly remarketingService;
    constructor(remarketingService: RemarketingService);
    listar(req: any): Promise<SuccessResponseDto>;
    crear(dto: CreateCampanaDto, req: any): Promise<SuccessResponseDto>;
    obtener(id: string, req: any): Promise<SuccessResponseDto>;
    eliminar(id: string, req: any): Promise<SuccessResponseDto>;
    cancelar(id: string, req: any): Promise<SuccessResponseDto>;
    ejecutar(id: string, req: any): Promise<SuccessResponseDto>;
}
