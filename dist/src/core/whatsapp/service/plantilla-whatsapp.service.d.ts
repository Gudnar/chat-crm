import { Repository } from 'typeorm';
import { PlantillaWhatsapp } from '../entity/plantilla-whatsapp.entity';
import { CreatePlantillaWhatsappDto } from '../dto/plantilla-whatsapp.dto';
import { WhatsappService } from './whatsapp.service';
import { BaseService } from '../../../common/base/base-service';
export declare class PlantillaWhatsappService extends BaseService {
    private readonly plantillaRepository;
    private readonly waService;
    constructor(plantillaRepository: Repository<PlantillaWhatsapp>, waService: WhatsappService);
    listar(clienteId: string): Promise<PlantillaWhatsapp[]>;
    obtener(id: string, clienteId: string): Promise<PlantillaWhatsapp>;
    crear(dto: CreatePlantillaWhatsappDto, clienteId: string, usuarioCreacion: string): Promise<PlantillaWhatsapp>;
    sincronizarEstado(id: string, clienteId: string): Promise<PlantillaWhatsapp>;
    private mapearEstadoMeta;
    actualizarEstadoPorWebhook(clienteId: string, metaTemplateId: string, evento: string, motivo?: string): Promise<void>;
    cronSincronizarPendientes(): Promise<void>;
    eliminar(id: string, clienteId: string, usuarioModificacion: string): Promise<void>;
    private construirComponentesMeta;
}
