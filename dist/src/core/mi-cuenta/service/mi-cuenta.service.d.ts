import { Repository } from 'typeorm';
import { Usuario } from '../../usuario/entity/usuario.entity';
import { Cliente } from '../../cliente/entity/cliente.entity';
import { RolCliente } from '../entity/rol-cliente.entity';
import { UpdateMiCuentaDto, CreateUsuarioClienteDto, UpdateUsuarioClienteDto, CreateRolClienteDto, UpdateRolClienteDto } from '../dto/mi-cuenta.dto';
export declare class MiCuentaService {
    private readonly clienteRepo;
    private readonly usuarioRepo;
    private readonly rolRepo;
    constructor(clienteRepo: Repository<Cliente>, usuarioRepo: Repository<Usuario>, rolRepo: Repository<RolCliente>);
    obtenerCliente(clienteId: string): Promise<Cliente>;
    actualizarCliente(clienteId: string, dto: UpdateMiCuentaDto, usuarioModificacion: string): Promise<Cliente>;
    listarRoles(clienteId: string): Promise<RolCliente[]>;
    obtenerRol(clienteId: string, id: string): Promise<RolCliente>;
    crearRol(clienteId: string, dto: CreateRolClienteDto, usuarioCreacion: string): Promise<RolCliente>;
    actualizarRol(clienteId: string, id: string, dto: UpdateRolClienteDto, usuarioModificacion: string): Promise<RolCliente>;
    eliminarRol(clienteId: string, id: string, usuarioModificacion: string): Promise<void>;
    crearRolesBase(clienteId: string, usuarioCreacion: string): Promise<void>;
    contarUsuariosPorRol(clienteId: string): Promise<Record<string, number>>;
    listarUsuarios(clienteId: string): Promise<any[]>;
    crearUsuario(clienteId: string, dto: CreateUsuarioClienteDto, usuarioCreacion: string): Promise<any>;
    actualizarUsuario(clienteId: string, id: string, dto: UpdateUsuarioClienteDto, usuarioModificacion: string): Promise<any>;
    eliminarUsuario(clienteId: string, id: string, usuarioModificacion: string): Promise<void>;
}
