import { Repository } from 'typeorm';
import { CampanaRemarketing } from '../entity/campana-remarketing.entity';
import { EnvioRemarketing } from '../entity/envio-remarketing.entity';
import { CreateCampanaDto } from '../dto/campana.dto';
import { Conversacion } from '../../conversacion/entity/conversacion.entity';
import { WhatsappService } from '../../whatsapp/service/whatsapp.service';
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service';
import { BaseService } from '../../../common/base/base-service';
export declare class RemarketingService extends BaseService {
    private readonly campanaRepo;
    private readonly envioRepo;
    private readonly convRepo;
    private readonly whatsappService;
    private readonly confClienteService;
    constructor(campanaRepo: Repository<CampanaRemarketing>, envioRepo: Repository<EnvioRemarketing>, convRepo: Repository<Conversacion>, whatsappService: WhatsappService, confClienteService: ConfiguracionClienteService);
    procesarCampanasProgramadas(): Promise<void>;
    listarCampanas(clienteId: string): Promise<any[]>;
    obtenerCampana(id: string, clienteId: string): Promise<any>;
    crearCampana(dto: CreateCampanaDto, userId: string, clienteId: string): Promise<CampanaRemarketing>;
    cancelarCampana(id: string, userId: string, clienteId: string): Promise<void>;
    eliminarCampana(id: string, userId: string, clienteId: string): Promise<void>;
    ejecutarCampanaAhora(id: string, clienteId: string): Promise<void>;
    private _ejecutar;
    private _generarMensajeIA;
}
