export declare class CreateCategoriaTiendaDto {
    nombre: string;
    imagenUrl?: string;
    orden?: number;
}
export declare class UpdateCategoriaTiendaDto extends CreateCategoriaTiendaDto {
    activo?: boolean;
    nombre: string;
}
