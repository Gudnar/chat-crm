export declare const SWAGGER_API_NAME = "IDE-IA API";
export declare const SWAGGER_API_DESCRIPTION = "API REST para la plataforma de gesti\u00F3n de Agentes IA con Anthropic Claude";
export declare const SWAGGER_API_CURRENT_VERSION = "1.0.0";
export declare const SWAGGER_API_ROOT = "docs";
export declare const Status: {
    ACTIVE: string;
    INACTIVE: string;
    PENDING: string;
    ELIMINATE: string;
};
export declare const Transacccion: {
    CREAR: string;
    ACTUALIZAR: string;
    ELIMINAR: string;
};
export declare const USUARIO_SISTEMA = "1";
export declare const USUARIO_NORMAL = "2";
export declare const Configurations: {
    WRONG_LOGIN_LIMIT: number;
    MINUTES_LOGIN_LOCK: number;
};
export declare const Roles: {
    SUPER_ADMIN: string;
    ADMIN_CLIENTE: string;
    COLABORADOR: string;
    AGENTE_HUMANO: string;
};
export declare const TipoAgente: {
    IA: string;
    HUMANO: string;
};
export declare const DisponibilidadAgente: {
    INACTIVO: string;
    DISPONIBLE: string;
    OCUPADO: string;
    AUSENTE: string;
};
export declare const TipoActividadAgente: {
    LOGIN: string;
    LOGOUT: string;
    CAMBIO_ESTADO: string;
    ASIGNACION: string;
    REASIGNACION: string;
    ESCALADA: string;
    CIERRE: string;
    NOTA: string;
};
export declare const ModoAgente: {
    FULL: string;
    HIBRID: string;
    ASSIST: string;
};
export declare const EstadoConversacion: {
    NUEVO: string;
    ABIERTO: string;
    PENDIENTE: string;
    RESUELTO: string;
    CERRADO: string;
};
export declare const EstadoOportunidad: {
    PROSPECTO: string;
    NECESITA_COTIZACION: string;
    COTIZACION_ENVIADA: string;
    REUNION_PENDIENTE: string;
    REUNION_REALIZADA: string;
    NEGOCIACION: string;
    GANADA: string;
    PERDIDA: string;
    CANCELADA: string;
};
export declare const ESTADOS_OPORTUNIDAD_FINALES: string[];
export declare const OrigenOportunidad: {
    WHATSAPP: string;
    FACEBOOK: string;
    INSTAGRAM: string;
    REFERENCIA: string;
    WEB: string;
    OTRO: string;
};
