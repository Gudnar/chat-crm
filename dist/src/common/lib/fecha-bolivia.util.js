"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utcAFechaHoraBolivia = exports.fechaHoraBoliviaAUtc = void 0;
const OFFSET_BOLIVIA_HORAS = 4;
function fechaHoraBoliviaAUtc(fechaHoraStr) {
    const normalizado = fechaHoraStr.trim().replace(' ', 'T');
    const [fecha, hora] = normalizado.split('T');
    const [anio, mes, dia] = fecha.split('-').map(Number);
    const [h, m] = (hora || '00:00').split(':').map(Number);
    return new Date(Date.UTC(anio, mes - 1, dia, h + OFFSET_BOLIVIA_HORAS, m, 0, 0));
}
exports.fechaHoraBoliviaAUtc = fechaHoraBoliviaAUtc;
function utcAFechaHoraBolivia(fecha) {
    const partes = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/La_Paz',
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(fecha);
    const valor = (tipo) => partes.find(p => p.type === tipo)?.value ?? '00';
    return {
        fecha: `${valor('year')}-${valor('month')}-${valor('day')}`,
        hora: `${valor('hour')}:${valor('minute')}`,
    };
}
exports.utcAFechaHoraBolivia = utcAFechaHoraBolivia;
//# sourceMappingURL=fecha-bolivia.util.js.map