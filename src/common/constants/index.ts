export const SWAGGER_API_NAME = 'IDE-IA API'
export const SWAGGER_API_DESCRIPTION = 'API REST para la plataforma de gestión de Agentes IA con Anthropic Claude'
export const SWAGGER_API_CURRENT_VERSION = '1.0.0'
export const SWAGGER_API_ROOT = 'docs'

export const Status = {
  ACTIVE: 'ACTIVO',
  INACTIVE: 'INACTIVO',
  PENDING: 'PENDIENTE',
  ELIMINATE: 'ELIMINADO',
}

export const Transacccion = {
  CREAR: 'CREAR',
  ACTUALIZAR: 'ACTUALIZAR',
  ELIMINAR: 'ELIMINAR',
}

export const USUARIO_SISTEMA = '1'
export const USUARIO_NORMAL = '2'

export const Configurations = {
  WRONG_LOGIN_LIMIT: 5,
  MINUTES_LOGIN_LOCK: 30,
}

export const Roles = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN_CLIENTE: 'ADMIN_CLIENTE',
  COLABORADOR: 'COLABORADOR',
  AGENTE_HUMANO: 'AGENTE_HUMANO',
}

export const TipoAgente = {
  IA: 'ia',
  HUMANO: 'humano',
}

export const DisponibilidadAgente = {
  INACTIVO: 'inactivo',
  DISPONIBLE: 'disponible',
  OCUPADO: 'ocupado',
  AUSENTE: 'ausente',
}

export const TipoActividadAgente = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  CAMBIO_ESTADO: 'cambio_estado',
  ASIGNACION: 'asignacion',
  REASIGNACION: 'reasignacion',
  ESCALADA: 'escalada',
  CIERRE: 'cierre',
  NOTA: 'nota',
}

export const ModoAgente = {
  FULL: 'full',
  HIBRID: 'hybrid',
  ASSIST: 'assist',
}

export const EstadoConversacion = {
  NUEVO: 'nuevo',
  ABIERTO: 'abierto',
  PENDIENTE: 'pendiente',
  RESUELTO: 'resuelto',
  CERRADO: 'cerrado',
}

export const EstadoOportunidad = {
  PROSPECTO: 'prospecto',
  NECESITA_COTIZACION: 'necesita-cotizacion',
  COTIZACION_ENVIADA: 'cotizacion-enviada',
  REUNION_PENDIENTE: 'reunion-pendiente',
  REUNION_REALIZADA: 'reunion-realizada',
  NEGOCIACION: 'negociacion',
  GANADA: 'ganada',
  PERDIDA: 'perdida',
  CANCELADA: 'cancelada',
}

export const ESTADOS_OPORTUNIDAD_FINALES = [
  EstadoOportunidad.GANADA,
  EstadoOportunidad.PERDIDA,
  EstadoOportunidad.CANCELADA,
]

export const OrigenOportunidad = {
  WHATSAPP: 'whatsapp',
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  REFERENCIA: 'referencia',
  WEB: 'web',
  OTRO: 'otro',
}
