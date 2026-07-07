import { Repository } from 'typeorm';
import { BaseConocimiento } from '../entity/base-conocimiento.entity';
import { CreateBaseConocimientoDto, UpdateBaseConocimientoDto } from '../dto/create-base-conocimiento.dto';
import { BaseService } from '../../../common/base/base-service';
export declare class BaseConocimientoService extends BaseService {
    private readonly repo;
    constructor(repo: Repository<BaseConocimiento>);
    listarPorAgente(agenteId: string): Promise<BaseConocimiento[]>;
    obtener(id: string): Promise<BaseConocimiento>;
    crear(dto: CreateBaseConocimientoDto, usuarioCreacion: string): Promise<BaseConocimiento>;
    actualizar(id: string, dto: UpdateBaseConocimientoDto, usuarioModificacion: string): Promise<BaseConocimiento>;
    eliminar(id: string, usuarioModificacion: string): Promise<void>;
    construirContexto(agenteId: string): Promise<string>;
}
