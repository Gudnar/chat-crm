import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../../usuario/service/usuario.service';
import { BaseService } from '../../../common/base/base-service';
export declare class AuthenticationService extends BaseService {
    private readonly usuarioService;
    private readonly jwtService;
    constructor(usuarioService: UsuarioService, jwtService: JwtService);
    validarUsuario(usuario: string, contrasenaBase64: string): Promise<{
        id: string;
        roles: string[];
        clienteId: string | null;
    } | null>;
    autenticar(user: {
        id: string;
        roles: string[];
        clienteId: string | null;
    }): Promise<{
        data: {
            id?: string | undefined;
            usuario?: string | undefined;
            contrasena?: string | undefined;
            correoElectronico?: string | undefined;
            nombres?: string | undefined;
            apellidos?: string | undefined;
            rol?: string | undefined;
            intentos?: number | undefined;
            fechaBloqueo?: Date | null | undefined;
            clienteId?: string | null | undefined;
            cliente?: import("../../cliente/entity/cliente.entity").Cliente | null | undefined;
            rolClienteId?: string | null | undefined;
            hashPassword?: (() => Promise<void>) | undefined;
            estado?: string | undefined;
            transaccion?: string | undefined;
            usuarioCreacion?: string | undefined;
            fechaCreacion?: Date | undefined;
            usuarioModificacion?: string | null | undefined;
            fechaModificacion?: Date | null | undefined;
            insertarTransaccion?: (() => void) | undefined;
            actualizarTransaccion?: (() => void) | undefined;
            hasId?: (() => boolean) | undefined;
            save?: ((options?: import("typeorm").SaveOptions | undefined) => Promise<import("../../usuario/entity/usuario.entity").Usuario>) | undefined;
            remove?: ((options?: import("typeorm").RemoveOptions | undefined) => Promise<import("../../usuario/entity/usuario.entity").Usuario>) | undefined;
            softRemove?: ((options?: import("typeorm").SaveOptions | undefined) => Promise<import("../../usuario/entity/usuario.entity").Usuario>) | undefined;
            recover?: ((options?: import("typeorm").SaveOptions | undefined) => Promise<import("../../usuario/entity/usuario.entity").Usuario>) | undefined;
            reload?: (() => Promise<void>) | undefined;
            access_token: string;
        };
    }>;
}
