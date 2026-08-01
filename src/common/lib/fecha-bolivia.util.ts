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
