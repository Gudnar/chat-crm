"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redimensionarImagen = void 0;
const sharp_1 = __importDefault(require("sharp"));
const DIMENSIONES = {
    banner: { width: 1200, height: 400 },
    producto: { width: 600, height: 600 },
    categoria: { width: 300, height: 300 },
    qr: { width: 500, height: 500 },
};
async function redimensionarImagen(buffer, preset) {
    const { width, height } = DIMENSIONES[preset];
    const fit = preset === 'qr' ? 'contain' : 'cover';
    return (0, sharp_1.default)(buffer)
        .resize(width, height, { fit, position: 'centre', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .webp({ quality: 82 })
        .toBuffer();
}
exports.redimensionarImagen = redimensionarImagen;
//# sourceMappingURL=imagen.util.js.map