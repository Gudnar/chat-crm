import { OportunidadService } from '../service/oportunidad.service';
import { AsignarOportunidadDto, CambiarEstadoOportunidadDto, CreateOportunidadDto, RegistrarSeguimientoDto, UpdateOportunidadDto } from '../dto/oportunidad.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class OportunidadController {
    private readonly oportunidadService;
    constructor(oportunidadService: OportunidadService);
    private forzarAsignado;
    listar(q: string, estadoOportunidad: string, prioridad: string, asignadoA: string, pagina: string, limite: string, req: any): Promise<SuccessResponseDto>;
    estadisticas(req: any): Promise<SuccessResponseDto>;
    usuariosAsignables(req: any): Promise<SuccessResponseDto>;
    obtener(id: string, req: any): Promise<SuccessResponseDto>;
    crear(dto: CreateOportunidadDto, req: any): Promise<SuccessResponseDto>;
    actualizar(id: string, dto: UpdateOportunidadDto, req: any): Promise<SuccessResponseDto>;
    cambiarEstado(id: string, dto: CambiarEstadoOportunidadDto, req: any): Promise<SuccessResponseDto>;
    asignar(id: string, dto: AsignarOportunidadDto, req: any): Promise<SuccessResponseDto>;
    registrarSeguimiento(id: string, dto: RegistrarSeguimientoDto, req: any): Promise<SuccessResponseDto>;
    eliminar(id: string, req: any): Promise<SuccessResponseDto>;
}
