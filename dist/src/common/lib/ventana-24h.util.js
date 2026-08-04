"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estaFueraDeVentana24h = void 0;
const VENTANA_MS = 24 * 60 * 60 * 1000;
function estaFueraDeVentana24h(mensajes) {
    const ultimoDelUsuario = [...(mensajes || [])].reverse().find(m => m.role === 'user');
    if (!ultimoDelUsuario)
        return true;
    const transcurrido = Date.now() - new Date(ultimoDelUsuario.timestamp).getTime();
    return transcurrido >= VENTANA_MS;
}
exports.estaFueraDeVentana24h = estaFueraDeVentana24h;
//# sourceMappingURL=ventana-24h.util.js.map