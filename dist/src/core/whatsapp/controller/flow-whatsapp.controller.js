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
exports.FlowWhatsappController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const flow_whatsapp_service_1 = require("../service/flow-whatsapp.service");
const flow_whatsapp_dto_1 = require("../dto/flow-whatsapp.dto");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
let FlowWhatsappController = class FlowWhatsappController {
    constructor(flowService) {
        this.flowService = flowService;
    }
    async listar(req) {
        const datos = await this.flowService.listar(this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async obtener(id, req) {
        const datos = await this.flowService.obtener(id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crear(dto, req) {
        const datos = await this.flowService.crear(dto, this.clienteIdDe(req), req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Flow creado en borrador');
    }
    async actualizar(id, dto, req) {
        const datos = await this.flowService.actualizar(id, dto, this.clienteIdDe(req), req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Flow actualizado');
    }
    async publicar(id, req) {
        const datos = await this.flowService.publicar(id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos, 'Flow publicado');
    }
    async sincronizar(id, req) {
        const datos = await this.flowService.sincronizarEstado(id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos, 'Estado sincronizado con Meta');
    }
    async preview(id, req) {
        const previewUrl = await this.flowService.obtenerPreviewUrl(id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto({ previewUrl });
    }
    async eliminar(id, req) {
        await this.flowService.eliminar(id, this.clienteIdDe(req), req.user.id);
        return new success_response_dto_1.SuccessResponseDto(null, 'Flow eliminado');
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
], FlowWhatsappController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FlowWhatsappController.prototype, "obtener", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [flow_whatsapp_dto_1.CreateFlowWhatsappDto, Object]),
    __metadata("design:returntype", Promise)
], FlowWhatsappController.prototype, "crear", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, flow_whatsapp_dto_1.UpdateFlowWhatsappDto, Object]),
    __metadata("design:returntype", Promise)
], FlowWhatsappController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Post)(':id/publicar'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FlowWhatsappController.prototype, "publicar", null);
__decorate([
    (0, common_1.Post)(':id/sincronizar'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FlowWhatsappController.prototype, "sincronizar", null);
__decorate([
    (0, common_1.Get)(':id/preview'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FlowWhatsappController.prototype, "preview", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FlowWhatsappController.prototype, "eliminar", null);
FlowWhatsappController = __decorate([
    (0, swagger_1.ApiTags)('Flows WhatsApp'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('flows-whatsapp'),
    __metadata("design:paramtypes", [flow_whatsapp_service_1.FlowWhatsappService])
], FlowWhatsappController);
exports.FlowWhatsappController = FlowWhatsappController;
//# sourceMappingURL=flow-whatsapp.controller.js.map