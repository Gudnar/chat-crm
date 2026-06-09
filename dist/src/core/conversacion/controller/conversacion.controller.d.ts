import { ConversacionService } from '../service/conversacion.service';
import { CalificacionService } from '../service/calificacion.service';
import { CreateConversacionDto, AgregarMensajeDto } from '../dto/create-conversacion.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class ConversacionController {
    private readonly conversacionService;
    private readonly calificacionService;
    constructor(conversacionService: ConversacionService, calificacionService: CalificacionService);
    listar(agenteId: string, req: any): Promise<SuccessResponseDto>;
    estadisticas(agenteId: string, req: any): Promise<SuccessResponseDto>;
    obtenerConfigCalificacion(req: any): Promise<SuccessResponseDto>;
    guardarConfigCalificacion(body: any, req: any): Promise<SuccessResponseDto>;
    calificarLote(req: any): Promise<SuccessResponseDto>;
    obtener(id: string): Promise<SuccessResponseDto>;
    crear(dto: CreateConversacionDto, req: any): Promise<SuccessResponseDto>;
    agregarMensaje(id: string, dto: AgregarMensajeDto): Promise<SuccessResponseDto>;
    calificarConIA(id: string, req: any): Promise<SuccessResponseDto>;
    actualizarScore(id: string, score: number): Promise<SuccessResponseDto>;
    actualizarEstado(id: string, estadoConversacion: string): Promise<SuccessResponseDto>;
}
