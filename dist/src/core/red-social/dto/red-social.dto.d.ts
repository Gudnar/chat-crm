export declare class CreateCuentaRedSocialDto {
    plataforma: string;
    nombre: string;
    pageId: string;
    accessToken?: string;
    appSecret?: string;
    verifyToken?: string;
    agenteId?: string;
    enabled?: boolean;
}
export declare class UpdateCuentaRedSocialDto {
    nombre?: string;
    pageId?: string;
    accessToken?: string;
    appSecret?: string;
    verifyToken?: string;
    agenteId?: string;
    enabled?: boolean;
}
export declare class CreateRedSocialPostDto {
    plataforma: string;
    postId: string;
    titulo: string;
    agenteId?: string;
    cuentaId?: string;
    enabled?: boolean;
}
export declare class UpdateRedSocialPostDto {
    titulo?: string;
    postId?: string;
    plataforma?: string;
    agenteId?: string;
    cuentaId?: string;
    enabled?: boolean;
}
export declare class EnviarDMDto {
    recipientId: string;
    texto: string;
    plataforma: string;
}
export declare class TestConexionMetaDto {
    accessToken: string;
    pageId: string;
    plataforma: string;
}
