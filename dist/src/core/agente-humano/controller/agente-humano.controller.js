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
exports.AgenteHumanoController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const agente_humano_service_1 = require("../service/agente-humano.service");
const asignacion_service_1 = require("../service/asignacion.service");
const agente_humano_dto_1 = require("../dto/agente-humano.dto");
const jwt_auth_guard_1 = require("../../authentication/guards/jwt-auth.guard");
const roles_guard_1 = require("../../authentication/guards/roles.guard");
const roles_decorator_1 = require("../../authentication/decorators/roles.decorator");
const constants_1 = require("../../../common/constants");
const success_response_dto_1 = require("../../../common/dto/success-response.dto");
let AgenteHumanoController = class AgenteHumanoController {
    constructor(agenteHumanoService, asignacionService) {
        this.agenteHumanoService = agenteHumanoService;
        this.asignacionService = asignacionService;
    }
    async listar(req) {
        const datos = await this.agenteHumanoService.listar(this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async crear(dto, req) {
        const datos = await this.agenteHumanoService.crear(dto, req.user.id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos, 'Agente humano creado. Ya puede iniciar sesión con sus credenciales.');
    }
    async disponibles(req) {
        const datos = await this.agenteHumanoService.obtenerDisponibles(this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async estadisticasEquipo(req) {
        const datos = await this.agenteHumanoService.estadisticasEquipo(this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async cola(req) {
        const datos = await this.asignacionService.colaSinAsignar(this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async asignar(dto, req) {
        if (this.esAgenteHumano(req)) {
            const propio = await this.agentePropio(req);
            dto.agenteHumanoId = propio.id;
        }
        const datos = await this.asignacionService.asignar(dto, req.user.id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos, 'Conversación asignada correctamente.');
    }
    async asignacionAutomatica(req) {
        const datos = await this.asignacionService.asignacionAutomatica(req.user.id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos, `${datos.asignadas} conversación(es) asignada(s).`);
    }
    async cerrarConversacion(id, dto, req) {
        const actor = await this.resolverActor(req);
        const datos = await this.asignacionService.cerrar(id, dto, actor, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos, 'Conversación marcada como resuelta.');
    }
    async devolverAIa(id, req) {
        const actor = await this.resolverActor(req);
        const datos = await this.asignacionService.devolverAIa(id, actor, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos, 'Conversación devuelta al agente IA.');
    }
    async miPerfil(req) {
        const propio = await this.agentePropio(req);
        const datos = await this.agenteHumanoService.estadisticas(propio.id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async miDisponibilidad(dto, req) {
        const propio = await this.agentePropio(req);
        const datos = await this.agenteHumanoService.cambiarDisponibilidad(propio.id, dto.estado, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos, `Ahora estás ${dto.estado}.`);
    }
    async misConversaciones(req) {
        const propio = await this.agentePropio(req);
        const datos = await this.asignacionService.misConversaciones(propio.id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async obtener(id, req) {
        const datos = await this.agenteHumanoService.obtener(id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async actualizar(id, dto, req) {
        const datos = await this.agenteHumanoService.actualizar(id, dto, req.user.id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos, 'Agente humano actualizado.');
    }
    async eliminar(id, req) {
        await this.agenteHumanoService.eliminar(id, req.user.id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(null, 'Agente humano eliminado y credenciales desactivadas.');
    }
    async cambiarDisponibilidad(id, dto, req) {
        const datos = await this.agenteHumanoService.cambiarDisponibilidad(id, dto.estado, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async estadisticas(id, req) {
        const datos = await this.agenteHumanoService.estadisticas(id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    async actividad(id, req) {
        const datos = await this.agenteHumanoService.actividad(id, this.clienteIdDe(req));
        return new success_response_dto_1.SuccessResponseDto(datos);
    }
    clienteIdDe(req) {
        const deSesion = req.user?.clienteId;
        if (deSesion)
            return String(deSesion);
        const deQuery = req.query?.clienteId;
        if (deQuery)
            return String(deQuery);
        throw new common_1.BadRequestException('Debes indicar el cliente a administrar (parametro clienteId). Selecciona un cliente en el modulo Clientes.');
    }
    esAgenteHumano(req) {
        const roles = req.user?.roles ?? [];
        return roles.includes(constants_1.Roles.AGENTE_HUMANO);
    }
    async agentePropio(req) {
        const agente = await this.agenteHumanoService.obtenerPorUsuarioId(req.user.id);
        if (!agente)
            throw new common_1.NotFoundException('No tienes un perfil de agente humano asociado.');
        return agente;
    }
    async resolverActor(req) {
        if (this.esAgenteHumano(req)) {
            const propio = await this.agentePropio(req);
            return { agenteHumanoId: propio.id, usuarioId: req.user.id };
        }
        return { usuarioId: req.user.id };
    }
};
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(constants_1.Roles.SUPER_ADMIN, constants_1.Roles.ADMIN_CLIENTE),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgenteHumanoController.prototype, "listar", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(constants_1.Roles.SUPER_ADMIN, constants_1.Roles.ADMIN_CLIENTE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agente_humano_dto_1.CreateAgenteHumanoDto, Object]),
    __metadata("design:returntype", Promise)
], AgenteHumanoController.prototype, "crear", null);
__decorate([
    (0, common_1.Get)('disponibles'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgenteHumanoController.prototype, "disponibles", null);
__decorate([
    (0, common_1.Get)('equipo/estadisticas'),
    (0, roles_decorator_1.Roles)(constants_1.Roles.SUPER_ADMIN, constants_1.Roles.ADMIN_CLIENTE),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgenteHumanoController.prototype, "estadisticasEquipo", null);
__decorate([
    (0, common_1.Get)('cola'),
    (0, roles_decorator_1.Roles)(constants_1.Roles.SUPER_ADMIN, constants_1.Roles.ADMIN_CLIENTE, constants_1.Roles.AGENTE_HUMANO),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgenteHumanoController.prototype, "cola", null);
__decorate([
    (0, common_1.Post)('asignar'),
    (0, roles_decorator_1.Roles)(constants_1.Roles.SUPER_ADMIN, constants_1.Roles.ADMIN_CLIENTE, constants_1.Roles.AGENTE_HUMANO),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agente_humano_dto_1.AsignarConversacionDto, Object]),
    __metadata("design:returntype", Promise)
], AgenteHumanoController.prototype, "asignar", null);
__decorate([
    (0, common_1.Post)('asignacion-automatica'),
    (0, roles_decorator_1.Roles)(constants_1.Roles.SUPER_ADMIN, constants_1.Roles.ADMIN_CLIENTE),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgenteHumanoController.prototype, "asignacionAutomatica", null);
__decorate([
    (0, common_1.Post)('conversaciones/:id/cerrar'),
    (0, roles_decorator_1.Roles)(constants_1.Roles.SUPER_ADMIN, constants_1.Roles.ADMIN_CLIENTE, constants_1.Roles.AGENTE_HUMANO),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, agente_humano_dto_1.CerrarConversacionDto, Object]),
    __metadata("design:returntype", Promise)
], AgenteHumanoController.prototype, "cerrarConversacion", null);
__decorate([
    (0, common_1.Post)('conversaciones/:id/devolver-ia'),
    (0, roles_decorator_1.Roles)(constants_1.Roles.SUPER_ADMIN, constants_1.Roles.ADMIN_CLIENTE, constants_1.Roles.AGENTE_HUMANO),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AgenteHumanoController.prototype, "devolverAIa", null);
__decorate([
    (0, common_1.Get)('mi-perfil'),
    (0, roles_decorator_1.Roles)(constants_1.Roles.AGENTE_HUMANO),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgenteHumanoController.prototype, "miPerfil", null);
__decorate([
    (0, common_1.Patch)('mi-disponibilidad'),
    (0, roles_decorator_1.Roles)(constants_1.Roles.AGENTE_HUMANO),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agente_humano_dto_1.CambiarDisponibilidadDto, Object]),
    __metadata("design:returntype", Promise)
], AgenteHumanoController.prototype, "miDisponibilidad", null);
__decorate([
    (0, common_1.Get)('mis-conversaciones'),
    (0, roles_decorator_1.Roles)(constants_1.Roles.AGENTE_HUMANO),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgenteHumanoController.prototype, "misConversaciones", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(constants_1.Roles.SUPER_ADMIN, constants_1.Roles.ADMIN_CLIENTE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AgenteHumanoController.prototype, "obtener", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(constants_1.Roles.SUPER_ADMIN, constants_1.Roles.ADMIN_CLIENTE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, agente_humano_dto_1.UpdateAgenteHumanoDto, Object]),
    __metadata("design:returntype", Promise)
], AgenteHumanoController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(constants_1.Roles.SUPER_ADMIN, constants_1.Roles.ADMIN_CLIENTE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AgenteHumanoController.prototype, "eliminar", null);
__decorate([
    (0, common_1.Patch)(':id/disponibilidad'),
    (0, roles_decorator_1.Roles)(constants_1.Roles.SUPER_ADMIN, constants_1.Roles.ADMIN_CLIENTE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, agente_humano_dto_1.CambiarDisponibilidadDto, Object]),
    __metadata("design:returntype", Promise)
], AgenteHumanoController.prototype, "cambiarDisponibilidad", null);
__decorate([
    (0, common_1.Get)(':id/estadisticas'),
    (0, roles_decorator_1.Roles)(constants_1.Roles.SUPER_ADMIN, constants_1.Roles.ADMIN_CLIENTE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AgenteHumanoController.prototype, "estadisticas", null);
__decorate([
    (0, common_1.Get)(':id/actividad'),
    (0, roles_decorator_1.Roles)(constants_1.Roles.SUPER_ADMIN, constants_1.Roles.ADMIN_CLIENTE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AgenteHumanoController.prototype, "actividad", null);
AgenteHumanoController = __decorate([
    (0, swagger_1.ApiTags)('Agentes Humanos'),
    (0, swagger_1.ApiBearerAuth)('defaultBearerAuth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('agentes-humanos'),
    __metadata("design:paramtypes", [agente_humano_service_1.AgenteHumanoService,
        asignacion_service_1.AsignacionService])
], AgenteHumanoController);
exports.AgenteHumanoController = AgenteHumanoController;
//# sourceMappingURL=agente-humano.controller.js.map