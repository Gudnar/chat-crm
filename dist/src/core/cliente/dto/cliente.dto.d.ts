export declare class CreateClienteDto {
    nombre: string;
    slug: string;
    logoUrl?: string;
    correoContacto?: string;
    telefono?: string;
    plan?: string;
    diasAtencion?: string[];
    horaInicioAtencion?: string;
    horaFinAtencion?: string;
    servicios?: string[];
    horarios?: {
        dia: string;
        franjas: {
            inicio: string;
            fin: string;
        }[];
    }[];
}
export declare class UpdateClienteDto extends CreateClienteDto {
    activo?: boolean;
}
