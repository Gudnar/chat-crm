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
exports.PlantillaWhatsappController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const plantilla_whatsapp_service_1 = require("../service/plantilla-whatsapp.service");
const plantilla_whatsapp_dto_1 = require("../dto/plantilla-whatsapp.dto");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
let PlantillaWhatsappController = class PlantillaWhatsappController {
    constructor(plantillaService) {
        this.plantillaService = plantillaService;
    }
    async listar(req) {
        const datos = await this.plantillaService.listar(this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async obtener(id, req) {
        const datos = await this.plantillaService.obtener(id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crear(dto, req) {
        const datos = await this.plantillaService.crear(dto, this.clienteIdDe(req), req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Plantilla enviada a revisión de Meta');
    }
    async sincronizar(id, req) {
        const datos = await this.plantillaService.sincronizarEstado(id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos, 'Estado sincronizado con Meta');
    }
    async eliminar(id, req) {
        await this.plantillaService.eliminar(id, this.clienteIdDe(req), req.user.id);
        return new success_response_dto_1.SuccessResponseDto(null, 'Plantilla eliminada');
    }
    clienteIdDe(req) {
        const deSesion = req.user?.clienteId;
        if (deSesion)
            return String(deSesion);
        const deQuery = req.query?.clienteId;
        if (deQuery)
            return String(deQuery);
        throw new common_1.BadRequestException('Debes indicar el cliente a administrar (parámetro clienteId)');
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlantillaWhatsappController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlantillaWhatsappController.prototype, "obtener", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [plantilla_whatsapp_dto_1.CreatePlantillaWhatsappDto, Object]),
    __metadata("design:returntype", Promise)
], PlantillaWhatsappController.prototype, "crear", null);
__decorate([
    (0, common_1.Post)(':id/sincronizar'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlantillaWhatsappController.prototype, "sincronizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlantillaWhatsappController.prototype, "eliminar", null);
PlantillaWhatsappController = __decorate([
    (0, swagger_1.ApiTags)('Plantillas WhatsApp'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('plantillas-whatsapp'),
    __metadata("design:paramtypes", [plantilla_whatsapp_service_1.PlantillaWhatsappService])
], PlantillaWhatsappController);
exports.PlantillaWhatsappController = PlantillaWhatsappController;
//# sourceMappingURL=plantilla-whatsapp.controller.js.map