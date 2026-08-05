import { FlowWhatsappService } from '../service/flow-whatsapp.service';
import { CreateFlowWhatsappDto, UpdateFlowWhatsappDto } from '../dto/flow-whatsapp.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class FlowWhatsappController {
    private readonly flowService;
    constructor(flowService: FlowWhatsappService);
    listar(req: any): Promise<SuccessResponseDto>;
    obtener(id: string, req: any): Promise<SuccessResponseDto>;
    crear(dto: CreateFlowWhatsappDto, req: any): Promise<SuccessResponseDto>;
    actualizar(id: string, dto: UpdateFlowWhatsappDto, req: any): Promise<SuccessResponseDto>;
    publicar(id: string, req: any): Promise<SuccessResponseDto>;
    sincronizar(id: string, req: any): Promise<SuccessResponseDto>;
    preview(id: string, req: any): Promise<SuccessResponseDto>;
    eliminar(id: string, req: any): Promise<SuccessResponseDto>;
    private clienteIdDe;
}
