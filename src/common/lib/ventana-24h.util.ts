/**
 * WhatsApp Cloud API solo permite texto libre dentro de las 24h desde el último
 * mensaje del cliente ("customer service window"). Pasado ese punto, Meta rechaza
 * cualquier enviarTexto y exige una plantilla aprobada (type: 'template').
 */

interface MensajeConTimestamp {
  role: string
  timestamp: string
}

const VENTANA_MS = 24 * 60 * 60 * 1000

/** true si ya pasaron 24h+ desde el último mensaje del cliente (o si nunca escribió). */
export function estaFueraDeVentana24h(mensajes: MensajeConTimestamp[]): boolean {
  const ultimoDelUsuario = [...(mensajes || [])].reverse().find(m => m.role === 'user')
  if (!ultimoDelUsuario) return true
  const transcurrido = Date.now() - new Date(ultimoDelUsuario.timestamp).getTime()
  return transcurrido >= VENTANA_MS
}
