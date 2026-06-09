import { Repository } from 'typeorm';
import { RedSocialCuenta } from '../entity/red-social-cuenta.entity';
import { RedSocialPost } from '../entity/red-social-post.entity';
import { CreateCuentaRedSocialDto, UpdateCuentaRedSocialDto, CreateRedSocialPostDto, UpdateRedSocialPostDto } from '../dto/red-social.dto';
import { BaseService } from '../../../common/base/base-service';
export declare class RedSocialService extends BaseService {
    private readonly cuentaRepo;
    private readonly postRepo;
    constructor(cuentaRepo: Repository<RedSocialCuenta>, postRepo: Repository<RedSocialPost>);
    listarCuentas(clienteId: string | null, plataforma?: string): Promise<RedSocialCuenta[]>;
    obtenerCuenta(id: string, clienteId: string | null): Promise<RedSocialCuenta>;
    crearCuenta(dto: CreateCuentaRedSocialDto, usuarioCreacion: string, clienteId: string): Promise<RedSocialCuenta>;
    actualizarCuenta(id: string, dto: UpdateCuentaRedSocialDto, usuarioModificacion: string, clienteId: string | null): Promise<RedSocialCuenta>;
    eliminarCuenta(id: string, usuarioModificacion: string, clienteId: string): Promise<void>;
    obtenerCuentaRaw(id: string, clienteId: string | null): Promise<RedSocialCuenta | null>;
    resolverCuentaPorPageId(pageId: string): Promise<RedSocialCuenta | null>;
    resolverCuentaPorVerifyToken(verifyToken: string): Promise<RedSocialCuenta | null>;
    listarPosts(clienteId: string | null, cuentaId?: string): Promise<RedSocialPost[]>;
    obtenerPost(id: string, clienteId: string | null): Promise<RedSocialPost>;
    crearPost(dto: CreateRedSocialPostDto, usuarioCreacion: string, clienteId: string): Promise<RedSocialPost>;
    actualizarPost(id: string, dto: UpdateRedSocialPostDto, usuarioModificacion: string, clienteId: string): Promise<RedSocialPost>;
    eliminarPost(id: string, usuarioModificacion: string, clienteId: string): Promise<void>;
    resolverPostPorPostId(postId: string, clienteId: string): Promise<RedSocialPost | null>;
    sincronizarPosts(cuentaId: string, clienteId: string | null, usuarioCreacion: string): Promise<{
        sincronizados: number;
        actualizados: number;
    }>;
    testConexion(accessToken: string, pageId: string, plataforma: string): Promise<{
        valida: boolean;
        info?: any;
        mensaje: string;
    }>;
    enviarMensajeDM(recipientId: string, text: string, accessToken: string): Promise<void>;
    responderComentarioFB(commentId: string, text: string, accessToken: string): Promise<void>;
    responderComentarioIG(commentId: string, text: string, accessToken: string): Promise<void>;
    fetchNombreComentarista(commentId: string, accessToken: string): Promise<string | null>;
    enriquecerNombresComentaristas(clienteId: string | null): Promise<{
        actualizadas: number;
    }>;
    enviarDMDesdeAgente(recipientId: string, texto: string, plataforma: string, clienteId: string | null): Promise<{
        enviado: boolean;
        mensaje: string;
    }>;
}
