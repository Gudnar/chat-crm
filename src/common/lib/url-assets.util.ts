/**
 * Base pública para armar URLs de archivos servidos por este backend (imágenes de
 * productos/tienda, adjuntos de WhatsApp, recursos, etc.) que un <img> del navegador
 * carga directo. Deliberadamente separada de APP_URL: esa variable se usa para
 * endpoints que SÍ necesitan ser alcanzables desde afuera (webhook de WhatsApp,
 * callback de OAuth de Google) y puede apuntar a un túnel como ngrok — pero un túnel
 * gratuito de ngrok muestra una página de advertencia la primera vez que un navegador
 * lo visita, y una etiqueta <img src="..."> no puede completar ese paso: el navegador
 * recibe esa página HTML en vez de la imagen y Chrome la bloquea (net::ERR_BLOCKED_BY_ORB).
 * ASSETS_URL evita ese problema apuntando siempre a una URL directa (localhost en dev,
 * el dominio real en producción), sin pasar por el túnel.
 */
export function baseUrlAssets(): string {
  const base = process.env.ASSETS_URL || process.env.APP_URL || 'http://localhost:3001'
  return base.replace(/\/$/, '')
}
