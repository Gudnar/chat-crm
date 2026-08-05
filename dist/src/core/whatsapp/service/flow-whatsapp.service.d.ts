import { Repository } from 'typeorm';
import { FlowWhatsapp } from '../entity/flow-whatsapp.entity';
import { CreateFlowWhatsappDto, UpdateFlowWhatsappDto } from '../dto/flow-whatsapp.dto';
import { WhatsappService } from './whatsapp.service';
import { BaseService } from '../../../common/base/base-service';
export declare class FlowWhatsappService extends BaseService {
    private readonly flowRepository;
    private readonly waService;
    constructor(flowRepository: Repository<FlowWhatsapp>, waService: WhatsappService);
    listar(clienteId: string): Promise<FlowWhatsapp[]>;
    obtener(id: string, clienteId: string): Promise<FlowWhatsapp>;
    crear(dto: CreateFlowWhatsappDto, clienteId: string, usuarioCreacion: string): Promise<FlowWhatsapp>;
    actualizar(id: string, dto: UpdateFlowWhatsappDto, clienteId: string, usuarioModificacion: string): Promise<FlowWhatsapp>;
    publicar(id: string, clienteId: string): Promise<FlowWhatsapp>;
    sincronizarEstado(id: string, clienteId: string): Promise<FlowWhatsapp>;
    obtenerPreviewUrl(id: string, clienteId: string): Promise<string>;
    eliminar(id: string, clienteId: string, usuarioModificacion: string): Promise<void>;
    obtenerScreenId(): string;
    private validarCampos;
    private construirFlowJson;
}
