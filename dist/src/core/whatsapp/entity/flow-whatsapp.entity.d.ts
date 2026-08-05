import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export type TipoCampoFlow = 'TextInput' | 'TextArea' | 'DatePicker' | 'Dropdown' | 'RadioButtonsGroup' | 'CheckboxGroup';
export interface CampoFlow {
    tipo: TipoCampoFlow;
    nombre: string;
    etiqueta: string;
    requerido: boolean;
    opciones?: string[];
    inputType?: 'text' | 'email' | 'phone' | 'number';
}
export declare class FlowWhatsapp extends AuditoriaEntity {
    id: string;
    clienteId: string;
    nombre: string;
    categoria: string;
    estadoFlow: string;
    metaFlowId?: string | null;
    erroresValidacion?: string | null;
    cta: string;
    mensajeCuerpo: string;
    screenTitle: string;
    campos: CampoFlow[];
}
