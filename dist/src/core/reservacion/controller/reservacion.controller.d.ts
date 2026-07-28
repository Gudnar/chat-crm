import { ReservacionService } from '../service/reservacion.service';
import { CreateReservaDto, UpdateReservaDto, ActualizarEstadoReservaDto } from '../dto/reserva.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
import { AgenteHumanoService } from '../../agente-humano/service/agente-humano.service';
export declare class ReservacionController {
    private readonly reservacionService;
    private readonly agenteHumanoService;
    constructor(reservacionService: ReservacionService, agenteHumanoService: AgenteHumanoService);
    obtenerDisponibilidad(agenteId: string, fecha: string, duracionMinutos: string, req: any): Promise<SuccessResponseDto>;
    listarMias(req: any): Promise<SuccessResponseDto>;
    listar(agenteId: string, estado: string, desde: string, hasta: string, req: any): Promise<SuccessResponseDto>;
    obtener(id: string, req: any): Promise<SuccessResponseDto>;
    crear(dto: CreateReservaDto, req: any): Promise<SuccessResponseDto>;
    actualizar(id: string, dto: UpdateReservaDto, req: any): Promise<SuccessResponseDto>;
    actualizarEstado(id: string, dto: ActualizarEstadoReservaDto, req: any): Promise<SuccessResponseDto>;
    cancelar(id: string, req: any): Promise<SuccessResponseDto>;
    private clienteIdDe;
}
