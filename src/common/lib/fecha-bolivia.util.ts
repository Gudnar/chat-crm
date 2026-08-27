/**
 * Helpers para tratar fechas/horas de agendamiento como hora de Bolivia
 * (America/La_Paz, UTC-4 fijo, sin horario de verano) sin depender del timezone
 * del proceso — necesario porque en producción el servidor (Contabo) corre en
 * timezone de Europa, y `new Date(...)` sin offset explícito usa esa hora
 * ambiental en vez de la de Bolivia, corriendo citas horas (y a veces un día
 * calendario completo) respecto a lo que el cliente realmente pidió.
 */

const OFFSET_BOLIVIA_HORAS = 4 // Bolivia = UTC-4, se suma para llegar al instante UTC real

/** Convierte un string "YYYY-MM-DD[T ]HH:mm" interpretado como hora de Bolivia al instante UTC real. */
export function fechaHoraBoliviaAUtc(fechaHoraStr: string): Date {
  const normalizado = fechaHoraStr.trim().replace(' ', 'T')
  const [fecha, hora] = normalizado.split('T')
  const [anio, mes, dia] = fecha.split('-').map(Number)
  const [h, m] = (hora || '00:00').split(':').map(Number)
  return new Date(Date.UTC(anio, mes - 1, dia, h + OFFSET_BOLIVIA_HORAS, m, 0, 0))
}

/** Formatea un instante UTC a "YYYY-MM-DD" y "HH:mm" en hora de Bolivia (America/La_Paz), sin depender del timezone del servidor. */
export function utcAFechaHoraBolivia(fecha: Date): { fecha: string; hora: string } {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/La_Paz',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(fecha)
  const valor = (tipo: string) => partes.find(p => p.type === tipo)?.value ?? '00'
  return {
    fecha: `${valor('year')}-${valor('month')}-${valor('day')}`,
    hora: `${valor('hour')}:${valor('minute')}`,
  }
}
