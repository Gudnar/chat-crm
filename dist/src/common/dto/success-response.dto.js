"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuccessResponseDto = void 0;
class SuccessResponseDto {
    constructor(datos, mensaje = 'OK') {
        this.finalizado = true;
        this.mensaje = mensaje;
        this.datos = datos;
    }
}
exports.SuccessResponseDto = SuccessResponseDto;
//# sourceMappingURL=success-response.dto.js.map