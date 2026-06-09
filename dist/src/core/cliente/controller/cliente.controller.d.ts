import { ClienteService } from '../service/cliente.service';
import { MiCuentaService } from '../../mi-cuenta/service/mi-cuenta.service';
import { CreateClienteDto, UpdateClienteDto } from '../dto/cliente.dto';
import { CreateUsuarioClienteDto, UpdateUsuarioClienteDto } from '../../mi-cuenta/dto/mi-cuenta.dto';
import { SuccessResponseDto } from '../../../common/dto/success-response.dto';
export declare class ClienteController {
    private readonly clienteService;
    private readonly miCuentaService;
    constructor(clienteService: ClienteService, miCuentaService: MiCuentaService);
    listar(): Promise<SuccessResponseDto>;
    obtener(id: string): Promise<SuccessResponseDto>;
    resumen(id: string): Promise<SuccessResponseDto>;
    crear(dto: CreateClienteDto, req: any): Promise<SuccessResponseDto>;
    actualizar(id: string, dto: UpdateClienteDto, req: any): Promise<SuccessResponseDto>;
    eliminar(id: string, req: any): Promise<SuccessResponseDto>;
    listarRoles(id: string): Promise<SuccessResponseDto>;
    listarUsuarios(id: string): Promise<SuccessResponseDto>;
    crearUsuario(id: string, dto: CreateUsuarioClienteDto, req: any): Promise<SuccessResponseDto>;
    actualizarUsuario(id: string, userId: string, dto: UpdateUsuarioClienteDto, req: any): Promise<SuccessResponseDto>;
    eliminarUsuario(id: string, userId: string, req: any): Promise<SuccessResponseDto>;
}
