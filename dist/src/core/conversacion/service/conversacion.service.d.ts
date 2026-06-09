import { Repository } from 'typeorm';
import { Conversacion } from '../entity/conversacion.entity';
import { CreateConversacionDto, AgregarMensajeDto } from '../dto/create-conversacion.dto';
import { BaseService } from '../../../common/base/base-service';
export declare class ConversacionService extends BaseService {
    private readonly conversacionRepository;
    constructor(conversacionRepository: Repository<Conversacion>);
    listar(clienteId: string | null, agenteId?: string): Promise<Conversacion[]>;
    obtener(id: string): Promise<Conversacion>;
    crear(dto: CreateConversacionDto, usuarioCreacion: string, clienteId: string): Promise<Conversacion>;
    agregarMensaje(id: string, dto: AgregarMensajeDto): Promise<Conversacion>;
    actualizarScore(id: string, score: number): Promise<void>;
    actualizarEstado(id: string, estadoConversacion: string): Promise<void>;
    estadisticas(clienteId: string | null, agenteId?: string): Promise<any>;
}
