import { CampoFlow } from '../entity/flow-whatsapp.entity';
export declare class CreateFlowWhatsappDto {
    nombre: string;
    categoria: string;
    cta?: string;
    mensajeCuerpo: string;
    screenTitle?: string;
    campos: CampoFlow[];
}
export declare class UpdateFlowWhatsappDto {
    categoria?: string;
    cta?: string;
    mensajeCuerpo?: string;
    screenTitle?: string;
    campos?: CampoFlow[];
}
