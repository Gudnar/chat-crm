export declare class CreateAgenteDto {
    nombre: string;
    descripcion?: string;
    modelo?: string;
    tono?: string;
    idioma?: string;
    maxTokens?: number;
    systemPrompt?: string;
    modoOperacion?: string;
    avatar?: string;
    color?: string;
    recordatorioActivo?: boolean;
    recordatorioHoras?: number;
    recordatorioMensaje?: string;
    recordatorioCitaActivo?: boolean;
    recordatorioCitaHoras?: number;
    recordatorioCitaMensaje?: string;
    recordatorioCitaPlantillaId?: string;
}
export declare class UpdateAgenteDto extends CreateAgenteDto {
    activo?: boolean;
}
