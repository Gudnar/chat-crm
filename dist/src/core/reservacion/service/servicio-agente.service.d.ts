import { Repository } from 'typeorm';
import { ServicioAgente } from '../entity/servicio-agente.entity';
import { CreateServicioAgenteDto, UpdateServicioAgenteDto } from '../dto/servicio-agente.dto';
import { BaseService } from '../../../common/base/base-service';
export declare class ServicioAgenteService extends BaseService {
    private readonly servicioAgenteRepository;
    constructor(servicioAgenteRepository: Repository<ServicioAgente>);
    listarPorAgente(agenteId: string, clienteId: string): Promise<ServicioAgente[]>;
    obtener(id: string, clienteId: string): Promise<ServicioAgente>;
    crear(dto: CreateServicioAgenteDto, usuarioCreacion: string, clienteId: string): Promise<ServicioAgente>;
    actualizar(id: string, dto: UpdateServicioAgenteDto, usuarioModificacion: string, clienteId: string): Promise<ServicioAgente>;
    eliminar(id: string, usuarioModificacion: string, clienteId: string): Promise<void>;
}
