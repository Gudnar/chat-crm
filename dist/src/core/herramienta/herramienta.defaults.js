"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HERRAMIENTAS_DEFAULT = void 0;
exports.HERRAMIENTAS_DEFAULT = [
    {
        nombre: 'calificar_lead',
        label: 'Calificar Lead',
        descripcion: 'Actualiza el Lead Score (0-100) según el contenido de la conversación.',
        parametros: [
            { nombre: 'score', tipo: 'integer', descripcion: 'Valor del score entre 0 y 100', requerido: true, minimo: 0, maximo: 100 },
            { nombre: 'razon', tipo: 'string', descripcion: 'Justificación del score asignado', requerido: true },
        ],
        activa: true, autoConfirmar: true, confianzaMinima: 70, color: '#f59e0b', icono: 'qualify',
        ejemplo: 'calificar_lead({ score: 82, razon: "Mencionó presupuesto disponible" })',
    },
    {
        nombre: 'cambiar_estado',
        label: 'Cambiar Estado',
        descripcion: 'Cambia el estado de la conversación.',
        parametros: [
            { nombre: 'estado', tipo: 'enum', descripcion: 'Nuevo estado de la conversación', requerido: true, opciones: ['nuevo', 'abierto', 'pendiente', 'resuelto', 'cerrado'] },
        ],
        activa: true, autoConfirmar: true, confianzaMinima: 80, color: '#6366f1', icono: 'check',
    },
    {
        nombre: 'escalar_agente',
        label: 'Escalar a Humano',
        descripcion: 'Transfiere la conversación a un agente humano con contexto completo.',
        parametros: [
            { nombre: 'razon', tipo: 'string', descripcion: 'Motivo por el que se escala la conversación', requerido: true },
            { nombre: 'prioridad', tipo: 'enum', descripcion: 'Nivel de urgencia', requerido: true, opciones: ['alta', 'media', 'baja'] },
        ],
        activa: true, autoConfirmar: true, confianzaMinima: 60, color: '#ef4444', icono: 'user',
    },
    {
        nombre: 'crear_nota',
        label: 'Crear Nota Interna',
        descripcion: 'Agrega una nota interna visible solo para el equipo.',
        parametros: [
            { nombre: 'nota', tipo: 'string', descripcion: 'Contenido de la nota interna', requerido: true },
        ],
        activa: true, autoConfirmar: true, confianzaMinima: 50, color: '#64748b', icono: 'edit',
    },
    {
        nombre: 'buscar_producto',
        label: 'Buscar Producto',
        descripcion: 'Busca productos en el catálogo según lo que pide el cliente. Úsala cuando pregunten por productos, precios, disponibilidad, marca o modelo.',
        parametros: [
            { nombre: 'termino', tipo: 'string', descripcion: 'Término de búsqueda: nombre, marca, modelo o categoría del producto', requerido: true },
            { nombre: 'categoria', tipo: 'string', descripcion: 'Filtrar por categoría específica (opcional)', requerido: false },
        ],
        activa: true, autoConfirmar: true, confianzaMinima: 50, color: '#10b981', icono: 'search',
        ejemplo: 'buscar_producto({ termino: "zapatillas Nike", categoria: "calzado" })',
    },
    {
        nombre: 'enviar_catalogo',
        label: 'Enviar Catálogo PDF',
        descripcion: 'Envía el catálogo completo en PDF al chat del cliente. Úsala solo cuando pida explícitamente el catálogo, la lista completa o un archivo con todos los productos. Requiere que el cliente tenga CATALOGO_PDF_URL configurado.',
        parametros: [],
        activa: true, autoConfirmar: true, confianzaMinima: 60, color: '#0ea5e9', icono: 'file',
        ejemplo: 'enviar_catalogo({})',
    },
    {
        nombre: 'enviar_recurso',
        label: 'Enviar Recurso Multimedia',
        descripcion: 'Busca y envía un recurso (catálogo, ficha técnica, foto, audio o video) subido en la sección Recursos, por nombre, categoría o tema. Úsala cuando el cliente pida un archivo específico que no sea el catálogo general completo.',
        parametros: [
            { nombre: 'termino', tipo: 'string', descripcion: 'Palabra clave: nombre, categoría o tema del recurso a enviar (ej. "ficha técnica", "video demo", "catálogo")', requerido: true },
        ],
        activa: true, autoConfirmar: true, confianzaMinima: 60, color: '#8b5cf6', icono: 'paperclip',
        ejemplo: 'enviar_recurso({ termino: "ficha tecnica" })',
    },
];
//# sourceMappingURL=herramienta.defaults.js.map