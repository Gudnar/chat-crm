/// <reference types="node" />
export type PresetImagen = 'banner' | 'producto' | 'categoria' | 'qr';
export declare function redimensionarImagen(buffer: Buffer, preset: PresetImagen): Promise<Buffer>;
