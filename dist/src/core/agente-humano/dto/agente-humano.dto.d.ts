export declare class CreateAgenteHumanoDto {
    nombres: string;
    apellidos?: string;
    correoElectronico?: string;
    usuario: string;
    contrasena: string;
    avatar?: string;
    color?: string;
    especialidades?: string[];
    horasTrabajo?: Record<string, {
        inicio: string;
        fin: string;
    }>;
    descripcion?: string;
}
export declare class UpdateAgenteHumanoDto {
    nombres?: string;
    apellidos?: string;
    correoElectronico?: string;
    contrasena?: string;
    avatar?: string;
    color?: string;
    especialidades?: string[];
    horasTrabajo?: Record<string, {
        inicio: string;
        fin: string;
    }>;
    descripcion?: string;
    activo?: boolean;
}
export declare class CambiarDisponibilidadDto {
    estado: string;
}
export declare class AsignarConversacionDto {
    conversacionId: string;
    agenteHumanoId: string;
    razon?: string;
    esEscalada?: boolean;
}
export declare class CerrarConversacionDto {
    resolucion?: string;
}
