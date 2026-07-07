"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrigenOportunidad = exports.ESTADOS_OPORTUNIDAD_FINALES = exports.EstadoOportunidad = exports.EstadoConversacion = exports.ModoAgente = exports.TipoActividadAgente = exports.DisponibilidadAgente = exports.TipoAgente = exports.Roles = exports.Configurations = exports.USUARIO_NORMAL = exports.USUARIO_SISTEMA = exports.Transacccion = exports.Status = exports.SWAGGER_API_ROOT = exports.SWAGGER_API_CURRENT_VERSION = exports.SWAGGER_API_DESCRIPTION = exports.SWAGGER_API_NAME = void 0;
exports.SWAGGER_API_NAME = 'IDE-IA API';
exports.SWAGGER_API_DESCRIPTION = 'API REST para la plataforma de gestión de Agentes IA con Anthropic Claude';
exports.SWAGGER_API_CURRENT_VERSION = '1.0.0';
exports.SWAGGER_API_ROOT = 'docs';
exports.Status = {
    ACTIVE: 'ACTIVO',
    INACTIVE: 'INACTIVO',
    PENDING: 'PENDIENTE',
    ELIMINATE: 'ELIMINADO',
};
exports.Transacccion = {
    CREAR: 'CREAR',
    ACTUALIZAR: 'ACTUALIZAR',
    ELIMINAR: 'ELIMINAR',
};
exports.USUARIO_SISTEMA = '1';
exports.USUARIO_NORMAL = '2';
exports.Configurations = {
    WRONG_LOGIN_LIMIT: 5,
    MINUTES_LOGIN_LOCK: 30,
};
exports.Roles = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN_CLIENTE: 'ADMIN_CLIENTE',
    COLABORADOR: 'COLABORADOR',
    AGENTE_HUMANO: 'AGENTE_HUMANO',
};
exports.TipoAgente = {
    IA: 'ia',
    HUMANO: 'humano',
};
exports.DisponibilidadAgente = {
    INACTIVO: 'inactivo',
    DISPONIBLE: 'disponible',
    OCUPADO: 'ocupado',
    AUSENTE: 'ausente',
};
exports.TipoActividadAgente = {
    LOGIN: 'login',
    LOGOUT: 'logout',
    CAMBIO_ESTADO: 'cambio_estado',
    ASIGNACION: 'asignacion',
    REASIGNACION: 'reasignacion',
    ESCALADA: 'escalada',
    CIERRE: 'cierre',
    NOTA: 'nota',
};
exports.ModoAgente = {
    FULL: 'full',
    HIBRID: 'hybrid',
    ASSIST: 'assist',
};
exports.EstadoConversacion = {
    NUEVO: 'nuevo',
    ABIERTO: 'abierto',
    PENDIENTE: 'pendiente',
    RESUELTO: 'resuelto',
    CERRADO: 'cerrado',
};
exports.EstadoOportunidad = {
    PROSPECTO: 'prospecto',
    NECESITA_COTIZACION: 'necesita-cotizacion',
    COTIZACION_ENVIADA: 'cotizacion-enviada',
    REUNION_PENDIENTE: 'reunion-pendiente',
    REUNION_REALIZADA: 'reunion-realizada',
    NEGOCIACION: 'negociacion',
    GANADA: 'ganada',
    PERDIDA: 'perdida',
    CANCELADA: 'cancelada',
};
exports.ESTADOS_OPORTUNIDAD_FINALES = [
    exports.EstadoOportunidad.GANADA,
    exports.EstadoOportunidad.PERDIDA,
    exports.EstadoOportunidad.CANCELADA,
];
exports.OrigenOportunidad = {
    WHATSAPP: 'whatsapp',
    FACEBOOK: 'facebook',
    INSTAGRAM: 'instagram',
    REFERENCIA: 'referencia',
    WEB: 'web',
    OTRO: 'otro',
};
//# sourceMappingURL=index.js.map