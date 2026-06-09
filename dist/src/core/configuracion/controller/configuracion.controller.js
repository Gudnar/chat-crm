"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const configuracion_service_1 = require("../service/configuracion.service");
const configuracion_dto_1 = require("../dto/configuracion.dto");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
const response_messages_1 = require("../../../common/constants/response-messages");
let ConfiguracionController = class ConfiguracionController {
    constructor(configuracionService) {
        this.configuracionService = configuracionService;
    }
    async listar() {
        const datos = await this.configuracionService.listar();
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async set(dto, req) {
        const datos = await this.configuracionService.set(dto, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, response_messages_1.Messages.CONFIGURACION_SAVED);
    }
    async verificarApiKey(dto) {
        const resultado = await this.configuracionService.verificarApiKey(dto);
        return new success_response_dto_1.SuccessResponseDto(resultado, resultado.mensaje);
    }
};
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfiguracionController.prototype, "listar", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [configuracion_dto_1.SetConfiguracionDto, Object]),
    __metadata("design:returntype", Promise)
], ConfiguracionController.prototype, "set", null);
__decorate([
    (0, common_1.Post)('verificar-api-key'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [configuracion_dto_1.VerificarApiKeyDto]),
    __metadata("design:returntype", Promise)
], ConfiguracionController.prototype, "verificarApiKey", null);
ConfiguracionController = __decorate([
    (0, swagger_1.ApiTags)('Configuración'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('configuracion'),
    __metadata("design:paramtypes", [configuracion_service_1.ConfiguracionService])
], ConfiguracionController);
exports.ConfiguracionController = ConfiguracionController;
//# sourceMappingURL=configuracion.controller.js.map