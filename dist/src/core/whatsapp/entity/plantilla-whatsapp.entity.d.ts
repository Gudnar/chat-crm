import { AuditoriaEntity } from '../../../common/entity/auditoria.entity';
export interface ComponenteHeaderPlantilla {
    tipo: 'text' | 'image' | 'video' | 'document';
    texto?: string;
}
export interface ComponenteBodyPlantilla {
    texto: string;
    ejemplos?: string[];
}
export interface ComponenteBotonPlantilla {
    tipo: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
    texto: string;
    url?: string;
    telefono?: string;
}
export interface ComponentesPlantilla {
    header?: ComponenteHeaderPlantilla;
    body: ComponenteBodyPlantilla;
    footer?: string;
    botones?: ComponenteBotonPlantilla[];
}
export declare class PlantillaWhatsapp extends AuditoriaEntity {
    id: string;
    clienteId: string;
    nombre: string;
    idioma: string;
    categoria: string;
    estadoPlantilla: string;
    motivoRechazo?: string | null;
    metaTemplateId?: string | null;
    componentes: ComponentesPlantilla;
}
