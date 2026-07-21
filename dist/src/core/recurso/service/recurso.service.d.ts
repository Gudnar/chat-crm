/// <reference types="multer" />
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Recurso, TipoRecurso } from '../entity/recurso.entity';
import { CreateRecursoDto, UpdateRecursoDto } from '../dto/create-recurso.dto';
import { BaseService } from '../../../common/base/base-service';
export declare class RecursoService extends BaseService {
    private readonly recursoRepository;
    private readonly configService;
    constructor(recursoRepository: Repository<Recurso>, configService: ConfigService);
    listar(clienteId: string, filtros?: {
        tipo?: TipoRecurso;
        categoria?: string;
        activo?: boolean;
    }): Promise<Recurso[]>;
    obtener(id: string, clienteId: string): Promise<Recurso>;
    crear(dto: CreateRecursoDto, file: Express.Multer.File | undefined, usuarioCreacion: string, clienteId: string): Promise<Recurso>;
    private normalizarKeywords;
    private borrarArchivo;
    actualizar(id: string, dto: UpdateRecursoDto, usuarioModificacion: string, clienteId: string): Promise<Recurso>;
    eliminar(id: string, usuarioModificacion: string, clienteId: string): Promise<void>;
    buscarPorKeywords(clienteId: string, keyword: string): Promise<Recurso[]>;
    obtenerUrlPublica(recursoId: string, clienteId: string): Promise<string>;
    obtenerTiposPermitidos(): string[];
    obtenerMimeTypesPermitidos(): {
        [tipo: string]: string[];
    };
    obtenerLimites(): {
        [tipo: string]: {
            bytes: number;
            legible: string;
        };
    };
}
