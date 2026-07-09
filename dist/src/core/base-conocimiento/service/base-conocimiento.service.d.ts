/// <reference types="node" />
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
    private valorCelda;
    private normalizarHeader;
    exportarExcel(agenteId: string): Promise<Buffer>;
    importarExcel(buffer: Buffer, agenteId: string, usuarioCreacion: string): Promise<{
        creadas: number;
        actualizadas: number;
        errores: string[];
    }>;
    construirContexto(agenteId: string): Promise<string>;
}
