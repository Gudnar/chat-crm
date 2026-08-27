import { Repository } from 'typeorm';
import { Agente } from '../../agente/entity/agente.entity';
import { Reserva } from '../entity/reserva.entity';
import { CreateReservaDto, UpdateReservaDto, ActualizarEstadoReservaDto } from '../dto/reserva.dto';
import { ServicioAgenteService } from './servicio-agente.service';
import { HorarioAgenteService } from './horario-agente.service';
import { ExcepcionHorarioAgenteService } from './excepcion-horario-agente.service';
import { AgenteService } from '../../agente/service/agente.service';
import { BaseService } from '../../../common/base/base-service';
import { GoogleCalendarSyncService } from '../../google-calendar/service/google-calendar-sync.service';
export interface FiltrosReserva {
    agenteId?: string;
    estado?: string;
    desde?: string;
    hasta?: string;
}
export declare class ReservacionService extends BaseService {
    private readonly reservaRepository;
    private readonly servicioAgenteService;
    private readonly horarioAgenteService;
    private readonly agenteService;
    private readonly excepcionHorarioAgenteService;
    private readonly googleCalendarSyncService;
    constructor(reservaRepository: Repository<Reserva>, servicioAgenteService: ServicioAgenteService, horarioAgenteService: HorarioAgenteService, agenteService: AgenteService, excepcionHorarioAgenteService: ExcepcionHorarioAgenteService, googleCalendarSyncService: GoogleCalendarSyncService);
    listar(clienteId: string, filtros?: FiltrosReserva): Promise<Reserva[]>;
    obtener(id: string, clienteId: string): Promise<Reserva>;
    crear(dto: CreateReservaDto, usuarioCreacion: string, clienteId: string): Promise<Reserva>;
    actualizar(id: string, dto: UpdateReservaDto, usuarioModificacion: string, clienteId: string): Promise<Reserva>;
    actualizarEstado(id: string, dto: ActualizarEstadoReservaDto, usuarioModificacion: string, clienteId: string): Promise<Reserva>;
    obtenerDisponibilidad(agenteId: string, clienteId: string, fecha: string, duracionMinutos: number): Promise<string[]>;
    private normalizarNombre;
    buscarHumanoPorNombre(clienteId: string, nombreSolicitado: string): Promise<{
        agente: Agente | null;
        error?: string;
    }>;
    elegirHumanoDisponible(clienteId: string, fechaInicio: Date, fechaFin: Date): Promise<{
        agente: Agente | null;
        error?: string;
    }>;
    private estaLibreEnHorario;
    obtenerDisponibilidadEquipo(clienteId: string, fecha: string, duracionMinutos: number): Promise<string[]>;
    private aFechaLocal;
    private validarDentroDeHorario;
    private validarSinSolapamiento;
    listarPendientesParaRecordatorioCita(agenteId: string, horasAntes: number): Promise<Reserva[]>;
    marcarRecordatorioCitaEnviado(id: string): Promise<void>;
    private seSolapan;
    private generarCodigoReserva;
}
