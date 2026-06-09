import { MiCuentaService } from '../service/mi-cuenta.service';
import { UpdateMiCuentaDto, CreateUsuarioClienteDto, UpdateUsuarioClienteDto, CreateRolClienteDto, UpdateRolClienteDto } from '../dto/mi-cuenta.dto';
export declare class MiCuentaController {
    private readonly svc;
    constructor(svc: MiCuentaService);
    obtener(req: any): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../../cliente/entity/cliente.entity").Cliente;
    }>;
    actualizar(req: any, dto: UpdateMiCuentaDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../../cliente/entity/cliente.entity").Cliente;
    }>;
    listarRoles(req: any): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: {
            totalUsuarios: number;
            id: string;
            clienteId: string;
            nombre: string;
            descripcion?: string | undefined;
            permisos: import("../entity/rol-cliente.entity").PermisosRol;
            esBase: boolean;
            cliente: import("../../cliente/entity/cliente.entity").Cliente;
            estado: string;
            transaccion: string;
            usuarioCreacion: string;
            fechaCreacion: Date;
            usuarioModificacion?: string | null | undefined;
            fechaModificacion?: Date | null | undefined;
        }[];
    }>;
    crearRol(req: any, dto: CreateRolClienteDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/rol-cliente.entity").RolCliente;
    }>;
    actualizarRol(req: any, id: string, dto: UpdateRolClienteDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: import("../entity/rol-cliente.entity").RolCliente;
    }>;
    eliminarRol(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
    listarUsuarios(req: any): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any[];
    }>;
    crearUsuario(req: any, dto: CreateUsuarioClienteDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any;
    }>;
    actualizarUsuario(req: any, id: string, dto: UpdateUsuarioClienteDto): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: any;
    }>;
    eliminarUsuario(req: any, id: string): Promise<{
        finalizado: boolean;
        mensaje: string;
        datos: null;
    }>;
}
