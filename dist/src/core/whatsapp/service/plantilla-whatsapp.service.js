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
var PlantillaWhatsappService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlantillaWhatsappService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const plantilla_whatsapp_entity_1 = require("../entity/plantilla-whatsapp.entity");
const whatsapp_service_1 = require("./whatsapp.service");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
const NOMBRE_VALIDO = /^[a-z0-9_]+$/;
let PlantillaWhatsappService = PlantillaWhatsappService_1 = class PlantillaWhatsappService extends base_service_1.BaseService {
    constructor(plantillaRepository, waService) {
        super(PlantillaWhatsappService_1.name);
        this.plantillaRepository = plantillaRepository;
        this.waService = waService;
    }
    async listar(clienteId) {
        return this.plantillaRepository.find({
            where: { clienteId, estado: constants_1.Status.ACTIVE },
            order: { fechaCreacion: 'DESC' },
        });
    }
    async obtener(id, clienteId) {
        const plantilla = await this.plantillaRepository.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!plantilla)
            throw new common_1.NotFoundException('Plantilla no encontrada');
        return plantilla;
    }
    async crear(dto, clienteId, usuarioCreacion) {
        const nombre = dto.nombre.trim().toLowerCase();
        if (!NOMBRE_VALIDO.test(nombre)) {
            throw new common_1.BadRequestException('El nombre solo puede tener minúsculas, números y guion bajo (ej. "recordatorio_captura")');
        }
        if (!dto.componentes?.body?.texto?.trim()) {
            throw new common_1.BadRequestException('La plantilla necesita al menos el texto del body');
        }
        const idioma = dto.idioma || 'es';
        const config = await this.waService.obtenerConfig(clienteId);
        if (!config.wabaId || !config.accessToken) {
            throw new common_1.BadRequestException('Falta configurar WhatsApp (WABA ID / Access Token) antes de crear plantillas');
        }
        const payload = {
            name: nombre,
            category: dto.categoria,
            language: idioma,
            components: this.construirComponentesMeta(dto.componentes),
        };
        let metaTemplateId;
        let estadoPlantilla = constants_1.EstadoPlantillaWhatsapp.PENDIENTE_META;
        try {
            const respuesta = await this.waService.crearPlantillaMeta(config, payload);
            metaTemplateId = respuesta.id;
        }
        catch (err) {
            const msg = err?.response?.data?.error?.message || err.message;
            throw new common_1.BadRequestException(`Meta rechazó la creación de la plantilla: ${msg}`);
        }
        const plantilla = this.plantillaRepository.create({
            clienteId,
            nombre,
            idioma,
            categoria: dto.categoria,
            estadoPlantilla,
            metaTemplateId,
            componentes: dto.componentes,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.plantillaRepository.save(plantilla);
    }
    async sincronizarEstado(id, clienteId) {
        const plantilla = await this.obtener(id, clienteId);
        if (!plantilla.metaTemplateId)
            return plantilla;
        const config = await this.waService.obtenerConfig(clienteId);
        const respuesta = await this.waService.consultarEstadoPlantillaMeta(config, plantilla.metaTemplateId);
        plantilla.estadoPlantilla = this.mapearEstadoMeta(respuesta.status) || plantilla.estadoPlantilla;
        plantilla.motivoRechazo = respuesta.rejected_reason && respuesta.rejected_reason !== 'NONE' ? respuesta.rejected_reason : null;
        plantilla.transaccion = constants_1.Transacccion.ACTUALIZAR;
        return this.plantillaRepository.save(plantilla);
    }
    mapearEstadoMeta(estadoMeta) {
        const mapaEstados = {
            APPROVED: constants_1.EstadoPlantillaWhatsapp.APROBADA,
            REJECTED: constants_1.EstadoPlantillaWhatsapp.RECHAZADA,
            PENDING: constants_1.EstadoPlantillaWhatsapp.PENDIENTE_META,
            PAUSED: constants_1.EstadoPlantillaWhatsapp.PAUSADA,
        };
        return mapaEstados[estadoMeta];
    }
    async actualizarEstadoPorWebhook(clienteId, metaTemplateId, evento, motivo) {
        const plantilla = await this.plantillaRepository.findOne({
            where: { clienteId, metaTemplateId, estado: constants_1.Status.ACTIVE },
        });
        if (!plantilla) {
            this.logger.warn(`[WA] Webhook de plantilla ignorado: no existe metaTemplateId=${metaTemplateId} para clienteId=${clienteId}`);
            return;
        }
        const nuevoEstado = this.mapearEstadoMeta(evento);
        if (!nuevoEstado) {
            this.logger.warn(`[WA] Webhook de plantilla con evento desconocido: ${evento}`);
            return;
        }
        plantilla.estadoPlantilla = nuevoEstado;
        plantilla.motivoRechazo = motivo && motivo !== 'NONE' ? motivo : null;
        plantilla.transaccion = constants_1.Transacccion.ACTUALIZAR;
        await this.plantillaRepository.save(plantilla);
        this.logger.log(`[WA] Plantilla "${plantilla.nombre}" actualizada por webhook: ${evento}`);
    }
    async cronSincronizarPendientes() {
        const pendientes = await this.plantillaRepository.find({
            where: { estadoPlantilla: constants_1.EstadoPlantillaWhatsapp.PENDIENTE_META, estado: constants_1.Status.ACTIVE },
        });
        for (const plantilla of pendientes) {
            if (!plantilla.metaTemplateId)
                continue;
            try {
                await this.sincronizarEstado(plantilla.id, plantilla.clienteId);
            }
            catch (err) {
                this.logger.warn(`[WA] Cron sync plantilla ${plantilla.id} falló: ${err.message}`);
            }
        }
    }
    async eliminar(id, clienteId, usuarioModificacion) {
        const plantilla = await this.obtener(id, clienteId);
        try {
            const config = await this.waService.obtenerConfig(clienteId);
            await this.waService.eliminarPlantillaMeta(config, plantilla.nombre);
        }
        catch (err) {
            this.logger.warn(`No se pudo eliminar la plantilla "${plantilla.nombre}" en Meta: ${err.message}`);
        }
        plantilla.estado = constants_1.Status.ELIMINATE;
        plantilla.transaccion = constants_1.Transacccion.ELIMINAR;
        plantilla.usuarioModificacion = usuarioModificacion;
        await this.plantillaRepository.save(plantilla);
    }
    construirComponentesMeta(componentes) {
        const resultado = [];
        if (componentes.header?.texto) {
            resultado.push({ type: 'HEADER', format: (componentes.header.tipo || 'text').toUpperCase(), text: componentes.header.texto });
        }
        const ejemplos = componentes.body.ejemplos?.length ? { example: { body_text: [componentes.body.ejemplos] } } : {};
        resultado.push({ type: 'BODY', text: componentes.body.texto, ...ejemplos });
        if (componentes.footer) {
            resultado.push({ type: 'FOOTER', text: componentes.footer });
        }
        if (componentes.botones?.length) {
            resultado.push({
                type: 'BUTTONS',
                buttons: componentes.botones.map(b => ({
                    type: b.tipo,
                    text: b.texto,
                    ...(b.tipo === 'URL' ? { url: b.url } : {}),
                    ...(b.tipo === 'PHONE_NUMBER' ? { phone_number: b.telefono } : {}),
                })),
            });
        }
        return resultado;
    }
};
__decorate([
    (0, schedule_1.Cron)('0 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlantillaWhatsappService.prototype, "cronSincronizarPendientes", null);
PlantillaWhatsappService = PlantillaWhatsappService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(plantilla_whatsapp_entity_1.PlantillaWhatsapp)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        whatsapp_service_1.WhatsappService])
], PlantillaWhatsappService);
exports.PlantillaWhatsappService = PlantillaWhatsappService;
//# sourceMappingURL=plantilla-whatsapp.service.js.map