export declare class UpdateMiCuentaDto {
    nombre?: string;
    logoUrl?: string;
    correoContacto?: string;
    telefono?: string;
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
export declare class CreateUsuarioClienteDto {
    usuario: string;
    contrasena: string;
    nombres: string;
    apellidos?: string;
    correoElectronico?: string;
    rol?: string;
    rolClienteId?: string;
}
export declare class UpdateUsuarioClienteDto {
    nombres?: string;
    apellidos?: string;
    correoElectronico?: string;
    rol?: string;
    contrasena?: string;
    rolClienteId?: string;
}
export declare class CreateRolClienteDto {
    nombre: string;
    descripcion?: string;
    permisos?: Record<string, Record<string, boolean>>;
}
export declare class UpdateRolClienteDto {
    nombre?: string;
    descripcion?: string;
    permisos?: Record<string, Record<string, boolean>>;
}
