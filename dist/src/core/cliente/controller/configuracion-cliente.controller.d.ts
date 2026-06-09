import { ConfiguracionClienteService } from '../service/configuracion-cliente.service';
import { SetConfiguracionClienteDto } from '../dto/configuracion-cliente.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class ConfiguracionClienteController {
    private readonly configuracionClienteService;
    constructor(configuracionClienteService: ConfiguracionClienteService);
    listar(clienteId: string): Promise<SuccessResponseDto>;
    set(clienteId: string, dto: SetConfiguracionClienteDto, req: any): Promise<SuccessResponseDto>;
    eliminar(clienteId: string, clave: string, req: any): Promise<SuccessResponseDto>;
}
