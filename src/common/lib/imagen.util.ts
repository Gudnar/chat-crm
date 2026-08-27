import sharp from 'sharp'

export type PresetImagen = 'banner' | 'producto' | 'categoria' | 'qr'

const DIMENSIONES: Record<PresetImagen, { width: number; height: number }> = {
  banner: { width: 1200, height: 400 },
  producto: { width: 600, height: 600 },
  categoria: { width: 300, height: 300 },
  qr: { width: 500, height: 500 },
}

/**
 * Recorta/redimensiona una imagen subida al tamaño recomendado para el frontend de la
 * tienda online y la convierte a webp (más liviano, ya soportado en todos los navegadores
 * modernos) — así el admin puede subir cualquier foto tal cual la tiene en el celular sin
 * preocuparse por el tamaño, y el storefront siempre recibe archivos livianos y consistentes.
 *
 * El preset `qr` usa `contain` (nunca recorta) en vez de `cover` — recortar un QR puede
 * dejarlo inescaneable, a diferencia de una foto de producto donde recortar no importa.
 */
export async function redimensionarImagen(buffer: Buffer, preset: PresetImagen): Promise<Buffer> {
  const { width, height } = DIMENSIONES[preset]
  const fit = preset === 'qr' ? 'contain' : 'cover'
  return sharp(buffer)
    .resize(width, height, { fit, position: 'centre', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .webp({ quality: 82 })
    .toBuffer()
}
