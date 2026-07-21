import { TipoRecurso } from './entity/recurso.entity'

/**
 * Fuente única de verdad para tipos de archivo. La usan tanto el fileFilter de multer
 * (validar la subida) como el service (validar tamaño y resolver rutas), así el
 * destino en disco y la URL pública nunca se desincronizan.
 */

/** MIME types aceptados por cada tipo de recurso. */
export const MIME_POR_TIPO: Record<TipoRecurso, string[]> = {
  [TipoRecurso.PDF]: ['application/pdf'],
  [TipoRecurso.IMAGEN]: ['image/jpeg', 'image/png', 'image/webp'],
  [TipoRecurso.AUDIO]: ['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/aac', 'audio/amr'],
  [TipoRecurso.VIDEO]: ['video/mp4', 'video/3gpp'],
}

/**
 * Límites de tamaño de la WhatsApp Cloud API. No son arbitrarios: si un archivo los
 * excede, Meta rechaza el envío. Validar aquí evita guardar un recurso que jamás
 * se podrá enviar.
 * https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media
 */
export const LIMITE_BYTES_POR_TIPO: Record<TipoRecurso, number> = {
  [TipoRecurso.PDF]: 100 * 1024 * 1024, // 100 MB
  [TipoRecurso.IMAGEN]: 5 * 1024 * 1024, // 5 MB
  [TipoRecurso.AUDIO]: 16 * 1024 * 1024, // 16 MB
  [TipoRecurso.VIDEO]: 16 * 1024 * 1024, // 16 MB
}

/** Techo global para multer (el mayor de los límites). El chequeo fino va por tipo. */
export const LIMITE_BYTES_GLOBAL = 100 * 1024 * 1024

/**
 * Deduce el tipo de recurso a partir del MIME real del archivo.
 * Se deduce (en vez de confiar en lo que declara el cliente) para que el archivo
 * nunca quede en la carpeta equivocada ni se envíe por WhatsApp con el tipo errado.
 */
export function detectarTipo(mimetype: string): TipoRecurso | null {
  const mime = (mimetype || '').toLowerCase()
  for (const [tipo, mimes] of Object.entries(MIME_POR_TIPO)) {
    if (mimes.includes(mime)) return tipo as TipoRecurso
  }
  return null
}

/** Todos los MIME aceptados, en plano. */
export function mimesPermitidos(): string[] {
  return Object.values(MIME_POR_TIPO).flat()
}

export function formatearBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
