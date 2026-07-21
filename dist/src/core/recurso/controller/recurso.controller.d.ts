/// <reference types="multer" />
import { RecursoService } from '../service/recurso.service';
import { CreateRecursoDto, UpdateRecursoDto } from '../dto/create-recurso.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
import { TipoRecurso } from '../entity/recurso.entity';
export declare class RecursoController {
    private readonly recursoService;
    constructor(recursoService: RecursoService);
    listar(tipo?: TipoRecurso, categoria?: string, activo?: string, req?: any): Promise<SuccessResponseDto>;
    buscar(keyword: string, req: any): Promise<SuccessResponseDto>;
    obtenerTipos(): Promise<SuccessResponseDto>;
    obtener(id: string, req: any): Promise<SuccessResponseDto>;
    obtenerUrl(id: string, req: any): Promise<SuccessResponseDto>;
    crear(dto: CreateRecursoDto, archivo?: Express.Multer.File, req?: any): Promise<SuccessResponseDto>;
    actualizar(id: string, dto: UpdateRecursoDto, req: any): Promise<SuccessResponseDto>;
    eliminar(id: string, req: any): Promise<SuccessResponseDto>;
}
