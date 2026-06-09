import { Repository } from 'typeorm';
import { Configuracion } from '../entity/configuracion.entity';
import { SetConfiguracionDto, VerificarApiKeyDto } from '../dto/configuracion.dto';
import { BaseService } from '../../../common/base/base-service';
export declare class ConfiguracionService extends BaseService {
    private readonly configuracionRepository;
    constructor(configuracionRepository: Repository<Configuracion>);
    listar(): Promise<Partial<Configuracion>[]>;
    obtenerPorClave(clave: string): Promise<Configuracion | null>;
    set(dto: SetConfiguracionDto, usuarioCreacion: string): Promise<Configuracion>;
    verificarApiKey(dto: VerificarApiKeyDto): Promise<{
        valida: boolean;
        mensaje: string;
    }>;
}
