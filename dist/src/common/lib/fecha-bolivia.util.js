"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fechaHoraBoliviaAUtc = void 0;
const OFFSET_BOLIVIA_HORAS = 4;
function fechaHoraBoliviaAUtc(fechaHoraStr) {
    const normalizado = fechaHoraStr.trim().replace(' ', 'T');
    const [fecha, hora] = normalizado.split('T');
    const [anio, mes, dia] = fecha.split('-').map(Number);
    const [h, m] = (hora || '00:00').split(':').map(Number);
    return new Date(Date.UTC(anio, mes - 1, dia, h + OFFSET_BOLIVIA_HORAS, m, 0, 0));
}
exports.fechaHoraBoliviaAUtc = fechaHoraBoliviaAUtc;
//# sourceMappingURL=fecha-bolivia.util.js.map