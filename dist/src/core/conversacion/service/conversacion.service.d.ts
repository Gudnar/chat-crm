import { Repository } from 'typeorm';
import { Conversacion } from '../entity/conversacion.entity';
import { CreateConversacionDto, AgregarMensajeDto } from '../dto/create-conversacion.dto';
import { BaseService } from '../../../common/base/base-service';
export declare class ConversacionService extends BaseService {
    private readonly conversacionRepository;
    constructor(conversacionRepository: Repository<Conversacion>);
    listar(clienteId: string | null, agenteId?: string): Promise<Conversacion[]>;
    obtener(id: string): Promise<Conversacion>;
    obtenerPorClienteId(id: string, clienteId: string): Promise<Conversacion>;
    crear(dto: CreateConversacionDto, usuarioCreacion: string, clienteId: string): Promise<Conversacion>;
    agregarMensaje(id: string, dto: AgregarMensajeDto): Promise<Conversacion>;
    actualizarScore(id: string, score: number): Promise<void>;
    actualizarEstado(id: string, estadoConversacion: string): Promise<void>;
    escalar(id: string, razon?: string): Promise<void>;
    agregarNota(id: string, nota: string): Promise<void>;
    actualizarNotas(id: string, notas: string): Promise<Conversacion>;
    actualizarAgente(id: string, agenteId: string | null): Promise<Conversacion>;
    actualizarEtiquetas(id: string, etiquetas: string[]): Promise<Conversacion>;
    estadisticas(clienteId: string | null, agenteId?: string): Promise<any>;
}
