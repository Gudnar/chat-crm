"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
const common_1 = require("@nestjs/common");
class BaseService {
    constructor(name) {
        this.logger = new common_1.Logger(name);
    }
    successResponse(datos, mensaje = 'OK') {
        return { finalizado: true, mensaje, datos };
    }
    errorResponse(mensaje, datos = null) {
        return { finalizado: false, mensaje, datos };
    }
}
exports.BaseService = BaseService;
//# sourceMappingURL=base-service.js.map