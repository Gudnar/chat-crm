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
        descripcion: 'Busca productos en el catálogo según lo que pide el cliente. Úsala cuando pregunten por productos, precios, disponibilidad, marca o modelo. Cada resultado incluye una línea "Disponibilidad": respétala literalmente — si dice que el producto aún no está disponible y da una fecha futura, dile al cliente que estará disponible pronto / que recién llega esa fecha, NUNCA lo ofrezcas como disponible ahora mismo aunque tenga stock cargado.',
        parametros: [
            { nombre: 'termino', tipo: 'string', descripcion: 'Término de búsqueda: nombre, marca, modelo o categoría del producto', requerido: true },
            { nombre: 'categoria', tipo: 'string', descripcion: 'Filtrar por categoría específica (opcional)', requerido: false },
        ],
        activa: true, autoConfirmar: true, confianzaMinima: 50, color: '#10b981', icono: 'search',
        ejemplo: 'buscar_producto({ termino: "zapatillas Nike", categoria: "calzado" })',
    },
    {
        nombre: 'reservar_producto',
        label: 'Reservar Producto (descuenta stock)',
        descripcion: 'Descuenta 1 unidad de stock de un producto. Úsala SOLO cuando ya se confirmó una venta o reserva real con el cliente (ej. junto con agendar_cita o escalar_agente) — NUNCA la uses solo porque el cliente preguntó por un producto o mostró interés. Si el producto no tiene stock disponible, te avisa y no descuenta nada — en ese caso no le digas al cliente que quedó reservado.',
        parametros: [
            { nombre: 'termino', tipo: 'string', descripcion: 'Nombre exacto del producto/modelo a reservar (el mismo que devolvió buscar_producto)', requerido: true },
        ],
        activa: true, autoConfirmar: true, confianzaMinima: 70, color: '#ef4444', icono: 'package-minus',
        ejemplo: 'reservar_producto({ termino: "Toyota BZ5" })',
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
        nombre: 'consultar_disponibilidad',
        label: 'Consultar Disponibilidad',
        descripcion: 'Consulta los horarios reales disponibles en una fecha específica. Úsala ANTES de agendar_cita cuando el cliente pregunte por horarios/disponibilidad. IMPORTANTE: nunca le pidas un ID al cliente. Si quiere hablar con alguien específico, pasa su nombre en "agente" (ej. "María"). Si no especifica a nadie, omite "agente" por completo — se consulta la disponibilidad combinada de todo el equipo. Nunca inventes horarios sin haber llamado esta herramienta primero.',
        parametros: [
            { nombre: 'fecha', tipo: 'string', descripcion: 'Fecha en formato YYYY-MM-DD', requerido: true },
            { nombre: 'agente', tipo: 'string', descripcion: 'Nombre de la persona del equipo a consultar (ej. "María"). Omitir para ver disponibilidad de todo el equipo.', requerido: false },
            { nombre: 'duracion_minutos', tipo: 'integer', descripcion: 'Duración de la cita en minutos (por defecto 30)', requerido: false },
        ],
        activa: true, autoConfirmar: true, confianzaMinima: 60, color: '#0ea5e9', icono: 'clock',
        ejemplo: 'consultar_disponibilidad({ fecha: "2026-07-29", agente: "María", duracion_minutos: 30 })',
    },
    {
        nombre: 'agendar_cita',
        label: 'Agendar Cita',
        descripcion: 'Crea una reserva/cita. Úsala cuando el cliente acepte agendar una llamada o consulta. IMPORTANTE: nunca le pidas un ID de agente al cliente — si quiere hablar con alguien específico del equipo, pasa su NOMBRE en "agente" (ej. "María", "Carlos"). Si no pide a nadie en particular, omite "agente" por completo: el sistema elige automáticamente entre el equipo humano disponible en ese horario (o queda contigo, en seguimiento, si no hay equipo humano).',
        parametros: [
            { nombre: 'fecha_hora', tipo: 'string', descripcion: 'Fecha y hora en formato ISO 8601 o "YYYY-MM-DD HH:mm" (hora local)', requerido: true },
            { nombre: 'titulo', tipo: 'string', descripcion: 'Título breve de la cita (ej. "Consulta técnica", "Demo de producto")', requerido: true },
            { nombre: 'agente', tipo: 'string', descripcion: 'Nombre de la persona del equipo con quien agendar (ej. "María"). Omitir para asignación automática.', requerido: false },
            { nombre: 'duracion_minutos', tipo: 'integer', descripcion: 'Duración en minutos (por defecto 30)', requerido: false },
            { nombre: 'notas', tipo: 'string', descripcion: 'Notas de contexto para quien atienda la cita', requerido: false },
        ],
        activa: true, autoConfirmar: true, confianzaMinima: 70, color: '#22c55e', icono: 'calendar',
        ejemplo: 'agendar_cita({ fecha_hora: "2026-07-28 14:30", titulo: "Consulta técnica", agente: "María", notas: "Cliente reporta error en integración" })',
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
    {
        nombre: 'preguntar_opciones',
        label: 'Preguntar con Opciones',
        descripcion: 'Presenta al cliente una pregunta con botones táctiles para que elija en vez de escribir texto libre. Úsala cuando el cliente tenga que elegir entre 2 y 10 alternativas concretas (ej. "¿Opción 1 o Opción 2?", "¿Qué talla?", "¿Cuál sucursal?"). El cliente responde tocando un botón; su elección te llega como un mensaje normal con el texto exacto del botón que tocó — trátalo igual que si lo hubiera escrito.',
        parametros: [
            { nombre: 'pregunta', tipo: 'string', descripcion: 'La pregunta o mensaje que acompaña a los botones', requerido: true },
            {
                nombre: 'opciones', tipo: 'array', requerido: true,
                descripcion: 'Entre 2 y 10 opciones. Si son 3 o menos se muestran como botones directos; si son más, como una lista desplegable.',
                itemsPropiedades: [
                    { nombre: 'texto', tipo: 'string', descripcion: 'Texto de la opción (máx. 24 caracteres, WhatsApp lo recorta)', requerido: true },
                ],
            },
        ],
        activa: true, autoConfirmar: true, confianzaMinima: 50, color: '#f59e0b', icono: 'list',
        ejemplo: 'preguntar_opciones({ pregunta: "¿Qué talla prefieres?", opciones: [{texto:"S"},{texto:"M"},{texto:"L"}] })',
    },
    {
        nombre: 'enviar_boton_link',
        label: 'Enviar Botón con Link',
        descripcion: 'Manda un mensaje con un botón nativo que abre un link externo (checkout, formulario, portafolio, etc.), en vez de pegar la URL como texto plano. Úsala cuando quieras que el cliente visite una página fuera de WhatsApp con una experiencia más confiable que un link suelto en el texto.',
        parametros: [
            { nombre: 'mensaje', tipo: 'string', descripcion: 'Texto que acompaña al botón', requerido: true },
            { nombre: 'texto_boton', tipo: 'string', descripcion: 'Texto del botón (máx. 20 caracteres, ej. "Ver más", "Pagar ahora")', requerido: true },
            { nombre: 'url', tipo: 'string', descripcion: 'URL completa (debe empezar con http:// o https://) a la que el botón lleva', requerido: true },
        ],
        activa: true, autoConfirmar: true, confianzaMinima: 60, color: '#0ea5e9', icono: 'link',
        ejemplo: 'enviar_boton_link({ mensaje: "Podés ver el catálogo completo acá:", texto_boton: "Ver catálogo", url: "https://misitio.com/catalogo" })',
    },
    {
        nombre: 'solicitar_ubicacion',
        label: 'Solicitar Ubicación',
        descripcion: 'Le pide al cliente que comparta su ubicación real (GPS) con un botón nativo de WhatsApp, en vez de que la escriba a mano. Úsala para confirmar dirección de entrega o encontrar la sucursal más cercana. La ubicación que comparta llega con coordenadas reales, nunca la inventes.',
        parametros: [
            { nombre: 'mensaje', tipo: 'string', descripcion: 'Texto que explica por qué se pide la ubicación', requerido: true },
        ],
        activa: true, autoConfirmar: true, confianzaMinima: 60, color: '#22c55e', icono: 'map-pin',
        ejemplo: 'solicitar_ubicacion({ mensaje: "Para calcular el envío, ¿podrías compartir tu ubicación?" })',
    },
    {
        nombre: 'iniciar_flow',
        label: 'Iniciar Formulario (Flow)',
        descripcion: 'Manda un formulario nativo de WhatsApp (varios campos en una sola pantalla: texto, fecha, opciones) en vez de pedir los datos uno por uno en la conversación. Úsala cuando necesites capturar varios datos estructurados de una sola vez (ej. reserva, encuesta, datos de contacto) y exista un flow con ese nombre ya publicado. La respuesta del cliente te llega como un mensaje con los valores que completó en cada campo.',
        parametros: [
            { nombre: 'nombre_flow', tipo: 'string', descripcion: 'Nombre exacto del flow a enviar (lo configura el administrador en el módulo Flows)', requerido: true },
            { nombre: 'mensaje', tipo: 'string', descripcion: 'Texto que acompaña al botón que abre el formulario', requerido: true },
        ],
        activa: true, autoConfirmar: true, confianzaMinima: 60, color: '#ec4899', icono: 'file-text',
        ejemplo: 'iniciar_flow({ nombre_flow: "reserva_spa", mensaje: "Completá este formulario para tu reserva:" })',
    },
    {
        nombre: 'abrir_tienda',
        label: 'Abrir Tienda Online',
        descripcion: 'Manda al cliente el link de la tienda online del negocio, donde puede armar su pedido completo (con variantes/extras si aplica) sin tener que escribir todo por chat. El carrito queda atado a esta conversación, así que cuando el cliente confirme su pedido en la web, el resumen llega solo de vuelta acá. Solo funciona si el cliente activó su tienda online — si no está activa, no se manda nada.',
        parametros: [
            { nombre: 'mensaje', tipo: 'string', descripcion: 'Texto que acompaña al botón que abre la tienda (opcional, tiene un valor por defecto)', requerido: false },
        ],
        activa: true, autoConfirmar: true, confianzaMinima: 60, color: '#f97316', icono: 'shopping-cart',
        ejemplo: 'abrir_tienda({ mensaje: "Armá tu pedido directo acá 🛍️" })',
    },
    {
        nombre: 'crear_pedido',
        label: 'Crear Pedido',
        descripcion: 'Crea un pedido nuevo en la sucursal especificada con los items que el cliente solicitó. Úsala cuando el cliente ya decidió qué quiere comprar y está listo para confirmar. El sistema genera automáticamente un código de pedido y lo devuelve.',
        parametros: [
            { nombre: 'items', tipo: 'array', requerido: true, descripcion: 'Lista de productos a comprar con cantidad',
                itemsPropiedades: [
                    { nombre: 'nombre', tipo: 'string', descripcion: 'Nombre del producto', requerido: true },
                    { nombre: 'cantidad', tipo: 'integer', descripcion: 'Cantidad a comprar', requerido: true, minimo: 1 },
                    { nombre: 'precioUnitario', tipo: 'number', descripcion: 'Precio unitario del producto', requerido: true },
                ],
            },
            { nombre: 'tipoEntrega', tipo: 'enum', requerido: false, descripcion: 'Tipo de entrega (recojo o delivery)', opciones: ['recojo', 'delivery'] },
            { nombre: 'direccion', tipo: 'string', requerido: false, descripcion: 'Dirección de entrega si es delivery' },
            { nombre: 'notas', tipo: 'string', requerido: false, descripcion: 'Notas adicionales del pedido' },
        ],
        activa: true, autoConfirmar: true, confianzaMinima: 70, color: '#10b981', icono: 'check-circle',
        ejemplo: 'crear_pedido({ items: [{nombre:"Producto A", cantidad:2, precioUnitario:100}], tipoEntrega:"delivery", direccion:"Calle Principal 123" })',
    },
    {
        nombre: 'consultar_stock_sucursal',
        label: 'Consultar Stock por Sucursal',
        descripcion: 'Consulta la disponibilidad de un producto en una sucursal específica. Úsala cuando el cliente pregunte por stock o disponibilidad en una ubicación en particular.',
        parametros: [
            { nombre: 'nombreProducto', tipo: 'string', descripcion: 'Nombre del producto a consultar', requerido: true },
            { nombre: 'sucursal', tipo: 'string', descripcion: 'Nombre o código de la sucursal', requerido: true },
        ],
        activa: true, autoConfirmar: true, confianzaMinima: 60, color: '#0ea5e9', icono: 'inventory',
        ejemplo: 'consultar_stock_sucursal({ nombreProducto: "Zapatillas Nike", sucursal: "La Paz" })',
    },
    {
        nombre: 'consultar_estado_pedido',
        label: 'Consultar Estado del Pedido',
        descripcion: 'Consulta el estado actual de un pedido que ya fue creado. Útil para saber si está en preparación, listo o entregado.',
        parametros: [
            { nombre: 'codigoPedido', tipo: 'string', descripcion: 'Código del pedido (ej. LPZ-00001)', requerido: true },
        ],
        activa: true, autoConfirmar: true, confianzaMinima: 60, color: '#8b5cf6', icono: 'clock',
        ejemplo: 'consultar_estado_pedido({ codigoPedido: "LPZ-00001" })',
    },
];
//# sourceMappingURL=herramienta.defaults.js.map