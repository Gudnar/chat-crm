import { ComponentesPlantilla } from '../entity/plantilla-whatsapp.entity';
export declare class CreatePlantillaWhatsappDto {
    nombre: string;
    idioma?: string;
    categoria: string;
    componentes: ComponentesPlantilla;
}
export declare class EnviarPlantillaDto {
    celular: string;
    plantillaId: string;
    parametros?: string[];
}
