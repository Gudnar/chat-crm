import { ConfiguracionService } from '../service/configuracion.service';
import { SetConfiguracionDto, VerificarApiKeyDto } from '../dto/configuracion.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class ConfiguracionController {
    private readonly configuracionService;
    constructor(configuracionService: ConfiguracionService);
    listar(): Promise<SuccessResponseDto>;
    set(dto: SetConfiguracionDto, req: any): Promise<SuccessResponseDto>;
    verificarApiKey(dto: VerificarApiKeyDto): Promise<SuccessResponseDto>;
}
