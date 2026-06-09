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
var RedSocialController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedSocialController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const red_social_service_1 = require("../service/red-social.service");
const red_social_webhook_service_1 = require("../service/red-social-webhook.service");
const red_social_dto_1 = require("../dto/red-social.dto");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
let RedSocialController = RedSocialController_1 = class RedSocialController {
    constructor(redSocialService, webhookService) {
        this.redSocialService = redSocialService;
        this.webhookService = webhookService;
        this.logger = new common_1.Logger(RedSocialController_1.name);
    }
    async verificarWebhook(query, res) {
        const mode = query['hub.mode'];
        const token = query['hub.verify_token'];
        const challenge = query['hub.challenge'];
        const cuenta = await this.redSocialService.resolverCuentaPorVerifyToken(token);
        if (mode === 'subscribe' && cuenta) {
            this.logger.log(`[RS] Webhook verificado para cuenta ${cuenta.id} (${cuenta.plataforma})`);
            res.status(200).send(challenge);
        }
        else {
            this.logger.warn(`[RS] Verificación fallida — token: ${token}`);
            res.sendStatus(403);
        }
    }
    async recibirWebhook(body) {
        try {
            const obj = body.object;
            for (const entry of body.entry || []) {
                if (obj === 'instagram') {
                    this.webhookService.procesarEventoInstagram(entry)
                        .catch(e => this.logger.error(`[IG] async error: ${e.message}`));
                }
                else if (obj === 'page') {
                    this.webhookService.procesarEventoFacebook(entry)
                        .catch(e => this.logger.error(`[FB] async error: ${e.message}`));
                }
            }
        }
        catch (err) {
            this.logger.error(`[RS] Error en webhook: ${err.message}`);
        }
        return 'EVENT_RECEIVED';
    }
    async listarCuentas(req) {
        const datos = await this.redSocialService.listarCuentas(req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos, 'OK');
    }
    async crearCuenta(dto, req) {
        const datos = await this.redSocialService.crearCuenta(dto, req.user.id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Cuenta creada correctamente');
    }
    async actualizarCuenta(id, dto, req) {
        const datos = await this.redSocialService.actualizarCuenta(id, dto, req.user.id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Cuenta actualizada correctamente');
    }
    async eliminarCuenta(id, req) {
        await this.redSocialService.eliminarCuenta(id, req.user.id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(null, 'Cuenta eliminada correctamente');
    }
    async testConexion(dto) {
        return this.redSocialService.testConexion(dto.accessToken, dto.pageId, dto.plataforma);
    }
    async enviarDM(dto, req) {
        const datos = await this.redSocialService.enviarDMDesdeAgente(dto.recipientId, dto.texto, dto.plataforma, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Mensaje enviado');
    }
    async enriquecerComentaristas(req) {
        const datos = await this.redSocialService.enriquecerNombresComentaristas(req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos, `${datos.actualizadas} posts actualizados con nombres`);
    }
    async importarComentarios(id, req) {
        const datos = await this.webhookService.importarComentariosComoConversaciones(id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos, `${datos.importados} comentarios importados como conversaciones`);
    }
    async sincronizarPosts(id, req) {
        const datos = await this.redSocialService.sincronizarPosts(id, req.user.clienteId, req.user.id);
        return new success_response_dto_1.SuccessResponseDto(datos, `Sincronizado: ${datos.sincronizados} nuevos, ${datos.actualizados} actualizados`);
    }
    async listarPosts(req, cuentaId) {
        const datos = await this.redSocialService.listarPosts(req.user.clienteId, cuentaId);
        return new success_response_dto_1.SuccessResponseDto(datos, 'OK');
    }
    async crearPost(dto, req) {
        const datos = await this.redSocialService.crearPost(dto, req.user.id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Post registrado correctamente');
    }
    async actualizarPost(id, dto, req) {
        const datos = await this.redSocialService.actualizarPost(id, dto, req.user.id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(datos, 'Post actualizado correctamente');
    }
    async eliminarPost(id, req) {
        await this.redSocialService.eliminarPost(id, req.user.id, req.user.clienteId);
        return new success_response_dto_1.SuccessResponseDto(null, 'Post eliminado correctamente');
    }
};
__decorate([
    (0, common_1.Get)('webhook'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RedSocialController.prototype, "verificarWebhook", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RedSocialController.prototype, "recibirWebhook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('cuentas'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RedSocialController.prototype, "listarCuentas", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('cuentas'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [red_social_dto_1.CreateCuentaRedSocialDto, Object]),
    __metadata("design:returntype", Promise)
], RedSocialController.prototype, "crearCuenta", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('cuentas/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, red_social_dto_1.UpdateCuentaRedSocialDto, Object]),
    __metadata("design:returntype", Promise)
], RedSocialController.prototype, "actualizarCuenta", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('cuentas/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RedSocialController.prototype, "eliminarCuenta", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('test-conexion'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [red_social_dto_1.TestConexionMetaDto]),
    __metadata("design:returntype", Promise)
], RedSocialController.prototype, "testConexion", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('send-dm'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [red_social_dto_1.EnviarDMDto, Object]),
    __metadata("design:returntype", Promise)
], RedSocialController.prototype, "enviarDM", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('enriquecer-comentaristas'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RedSocialController.prototype, "enriquecerComentaristas", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('posts/:id/importar-comentarios'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RedSocialController.prototype, "importarComentarios", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('cuentas/:id/sincronizar'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RedSocialController.prototype, "sincronizarPosts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('posts'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('cuentaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RedSocialController.prototype, "listarPosts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('posts'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [red_social_dto_1.CreateRedSocialPostDto, Object]),
    __metadata("design:returntype", Promise)
], RedSocialController.prototype, "crearPost", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('posts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, red_social_dto_1.UpdateRedSocialPostDto, Object]),
    __metadata("design:returntype", Promise)
], RedSocialController.prototype, "actualizarPost", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('posts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RedSocialController.prototype, "eliminarPost", null);
RedSocialController = RedSocialController_1 = __decorate([
    (0, common_1.Controller)('red-social'),
    __metadata("design:paramtypes", [red_social_service_1.RedSocialService,
        red_social_webhook_service_1.RedSocialWebhookService])
], RedSocialController);
exports.RedSocialController = RedSocialController;
//# sourceMappingURL=red-social.controller.js.map