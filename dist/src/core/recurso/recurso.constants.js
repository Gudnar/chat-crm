"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatearBytes = exports.mimesPermitidos = exports.detectarTipo = exports.LIMITE_BYTES_GLOBAL = exports.LIMITE_BYTES_POR_TIPO = exports.MIME_POR_TIPO = void 0;
const recurso_entity_1 = require("./entity/recurso.entity");
exports.MIME_POR_TIPO = {
    [recurso_entity_1.TipoRecurso.PDF]: ['application/pdf'],
    [recurso_entity_1.TipoRecurso.IMAGEN]: ['image/jpeg', 'image/png', 'image/webp'],
    [recurso_entity_1.TipoRecurso.AUDIO]: ['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/aac', 'audio/amr'],
    [recurso_entity_1.TipoRecurso.VIDEO]: ['video/mp4', 'video/3gpp'],
};
exports.LIMITE_BYTES_POR_TIPO = {
    [recurso_entity_1.TipoRecurso.PDF]: 100 * 1024 * 1024,
    [recurso_entity_1.TipoRecurso.IMAGEN]: 5 * 1024 * 1024,
    [recurso_entity_1.TipoRecurso.AUDIO]: 16 * 1024 * 1024,
    [recurso_entity_1.TipoRecurso.VIDEO]: 16 * 1024 * 1024,
};
exports.LIMITE_BYTES_GLOBAL = 100 * 1024 * 1024;
function detectarTipo(mimetype) {
    const mime = (mimetype || '').toLowerCase();
    for (const [tipo, mimes] of Object.entries(exports.MIME_POR_TIPO)) {
        if (mimes.includes(mime))
            return tipo;
    }
    return null;
}
exports.detectarTipo = detectarTipo;
function mimesPermitidos() {
    return Object.values(exports.MIME_POR_TIPO).flat();
}
exports.mimesPermitidos = mimesPermitidos;
function formatearBytes(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
exports.formatearBytes = formatearBytes;
//# sourceMappingURL=recurso.constants.js.map