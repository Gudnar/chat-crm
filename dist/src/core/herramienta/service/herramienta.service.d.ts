import { Repository } from 'typeorm';
import { Herramienta } from '../entity/herramienta.entity';
import { CreateHerramientaDto, UpdateHerramientaDto } from '../dto/create-herramienta.dto';
import { BaseService } from '../../../common/base/base-service';
export interface ClaudeTool {
    name: string;
    description: string;
    input_schema: {
        type: 'object';
        properties: Record<string, any>;
        required: string[];
    };
}
export declare class HerramientaService extends BaseService {
    private readonly herramientaRepository;
    constructor(herramientaRepository: Repository<Herramienta>);
    listarPorAgente(agenteId: string): Promise<Herramienta[]>;
    obtener(id: string): Promise<Herramienta>;
    crear(dto: CreateHerramientaDto, usuarioCreacion: string): Promise<Herramienta>;
    actualizar(id: string, dto: UpdateHerramientaDto, usuarioModificacion: string): Promise<Herramienta>;
    eliminar(id: string, usuarioModificacion: string): Promise<void>;
    crearHerramientasPorDefecto(agenteId: string, usuarioCreacion: string): Promise<void>;
    convertirAFormatoClaudeTools(herramientas: Herramienta[]): ClaudeTool[];
    private construirInputSchema;
    private parsearParametroLegacy;
}
