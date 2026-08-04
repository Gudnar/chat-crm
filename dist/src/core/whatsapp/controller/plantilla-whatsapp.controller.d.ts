import { PlantillaWhatsappService } from '../service/plantilla-whatsapp.service';
import { CreatePlantillaWhatsappDto } from '../dto/plantilla-whatsapp.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class PlantillaWhatsappController {
    private readonly plantillaService;
    constructor(plantillaService: PlantillaWhatsappService);
    listar(req: any): Promise<SuccessResponseDto>;
    obtener(id: string, req: any): Promise<SuccessResponseDto>;
    crear(dto: CreatePlantillaWhatsappDto, req: any): Promise<SuccessResponseDto>;
    sincronizar(id: string, req: any): Promise<SuccessResponseDto>;
    eliminar(id: string, req: any): Promise<SuccessResponseDto>;
    private clienteIdDe;
}
