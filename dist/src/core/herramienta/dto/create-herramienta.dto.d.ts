export declare class CreateHerramientaDto {
    agenteId: string;
    nombre: string;
    label: string;
    descripcion: string;
    parametros?: string[];
    activa?: boolean;
    autoConfirmar?: boolean;
    confianzaMinima?: number;
    color?: string;
    icono?: string;
    ejemplo?: string;
}
export declare class UpdateHerramientaDto extends CreateHerramientaDto {
}
