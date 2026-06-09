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
exports.RemarketingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const remarketing_service_1 = require("../service/remarketing.service");
const campana_dto_1 = require("../dto/campana.dto");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
let RemarketingController = class RemarketingController {
    constructor(remarketingService) {
        this.remarketingService = remarketingService;
    }
    async listar(req) {
        const datos = await this.remarketingService.listarCampanas(req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crear(dto, req) {
        const datos = await this.remarketingService.crearCampana(dto, req.user.id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Campaña creada');
    }
    async obtener(id, req) {
        const datos = await this.remarketingService.obtenerCampana(id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async eliminar(id, req) {
        await this.remarketingService.eliminarCampana(id, req.user.id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(null, 'Campaña eliminada');
    }
    async cancelar(id, req) {
        await this.remarketingService.cancelarCampana(id, req.user.id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(null, 'Campaña cancelada');
    }
    async ejecutar(id, req) {
        await this.remarketingService.ejecutarCampanaAhora(id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(null, 'Campaña ejecutada');
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RemarketingController.prototype, "listar", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [campana_dto_1.CreateCampanaDto, Object]),
    __metadata("design:returntype", Promise)
], RemarketingController.prototype, "crear", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RemarketingController.prototype, "obtener", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RemarketingController.prototype, "eliminar", null);
__decorate([
    (0, common_1.Patch)(':id/cancelar'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RemarketingController.prototype, "cancelar", null);
__decorate([
    (0, common_1.Post)(':id/ejecutar'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RemarketingController.prototype, "ejecutar", null);
RemarketingController = __decorate([
    (0, swagger_1.ApiTags)('Remarketing'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('remarketing'),
    __metadata("design:paramtypes", [remarketing_service_1.RemarketingService])
], RemarketingController);
exports.RemarketingController = RemarketingController;
//# sourceMappingURL=remarketing.controller.js.map