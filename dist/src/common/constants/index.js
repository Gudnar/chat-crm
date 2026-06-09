"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadoConversacion = exports.ModoAgente = exports.Roles = exports.Configurations = exports.USUARIO_NORMAL = exports.USUARIO_SISTEMA = exports.Transacccion = exports.Status = exports.SWAGGER_API_ROOT = exports.SWAGGER_API_CURRENT_VERSION = exports.SWAGGER_API_DESCRIPTION = exports.SWAGGER_API_NAME = void 0;
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
//# sourceMappingURL=index.js.map