import { Repository } from 'typeorm';
import { Usuario } from '../entity/usuario.entity';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { BaseService } from '../../../common/base/base-service';
export declare class UsuarioService extends BaseService {
    private readonly usuarioRepository;
    constructor(usuarioRepository: Repository<Usuario>);
    buscarUsuario(usuario: string): Promise<Usuario | null>;
    buscarUsuarioId(id: string): Promise<Partial<Usuario> | null>;
    listar(): Promise<Usuario[]>;
    crear(dto: CreateUsuarioDto, usuarioCreacion: string): Promise<Usuario>;
    actualizarContadorBloqueos(id: string, intentos: number): Promise<void>;
    actualizarDatosBloqueo(id: string, codigo: string | null, fecha: any): Promise<void>;
}
