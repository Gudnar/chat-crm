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
var FlowWhatsappService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowWhatsappService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const flow_whatsapp_entity_1 = require("../entity/flow-whatsapp.entity");
const whatsapp_service_1 = require("./whatsapp.service");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
const NOMBRE_VALIDO = /^[a-z0-9_]+$/;
const SCREEN_ID = 'FORMULARIO';
let FlowWhatsappService = FlowWhatsappService_1 = class FlowWhatsappService extends base_service_1.BaseService {
    constructor(flowRepository, waService) {
        super(FlowWhatsappService_1.name);
        this.flowRepository = flowRepository;
        this.waService = waService;
    }
    async listar(clienteId) {
        return this.flowRepository.find({
            where: { clienteId, estado: constants_1.Status.ACTIVE },
            order: { fechaCreacion: 'DESC' },
        });
    }
    async obtener(id, clienteId) {
        const flow = await this.flowRepository.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!flow)
            throw new common_1.NotFoundException('Flow no encontrado');
        return flow;
    }
    async crear(dto, clienteId, usuarioCreacion) {
        const nombre = dto.nombre.trim().toLowerCase();
        if (!NOMBRE_VALIDO.test(nombre)) {
            throw new common_1.BadRequestException('El nombre solo puede tener minúsculas, números y guion bajo (ej. "reserva_spa")');
        }
        this.validarCampos(dto.campos);
        const config = await this.waService.obtenerConfig(clienteId);
        if (!config.wabaId || !config.accessToken) {
            throw new common_1.BadRequestException('Falta configurar WhatsApp (WABA ID / Access Token) antes de crear flows');
        }
        const screenTitle = dto.screenTitle?.trim() || 'Formulario';
        const flowJson = this.construirFlowJson(dto.campos, screenTitle);
        let metaFlowId;
        try {
            const respuesta = await this.waService.crearFlowMeta(config, {
                name: nombre,
                categories: [dto.categoria],
                flow_json: flowJson,
            });
            metaFlowId = respuesta.id;
        }
        catch (err) {
            const msg = err?.response?.data?.error?.error_user_msg || err?.response?.data?.error?.message || err.message;
            throw new common_1.BadRequestException(`Meta rechazó la creación del flow: ${msg}`);
        }
        const flow = this.flowRepository.create({
            clienteId,
            nombre,
            categoria: dto.categoria,
            estadoFlow: constants_1.EstadoFlowWhatsapp.BORRADOR,
            metaFlowId,
            cta: dto.cta?.trim() || 'Comenzar',
            mensajeCuerpo: dto.mensajeCuerpo,
            screenTitle,
            campos: dto.campos,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.flowRepository.save(flow);
    }
    async actualizar(id, dto, clienteId, usuarioModificacion) {
        const flow = await this.obtener(id, clienteId);
        if (flow.estadoFlow !== constants_1.EstadoFlowWhatsapp.BORRADOR) {
            throw new common_1.BadRequestException('Solo se puede editar un flow en borrador — duplicalo si querés cambiar uno publicado');
        }
        if (dto.campos)
            this.validarCampos(dto.campos);
        flow.categoria = dto.categoria ?? flow.categoria;
        flow.cta = dto.cta?.trim() || flow.cta;
        flow.mensajeCuerpo = dto.mensajeCuerpo ?? flow.mensajeCuerpo;
        flow.screenTitle = dto.screenTitle?.trim() || flow.screenTitle;
        flow.campos = dto.campos ?? flow.campos;
        if (dto.campos || dto.screenTitle) {
            const config = await this.waService.obtenerConfig(clienteId);
            const flowJson = this.construirFlowJson(flow.campos, flow.screenTitle);
            try {
                await this.waService.actualizarFlowMeta(config, flow.metaFlowId, flowJson);
            }
            catch (err) {
                const msg = err?.response?.data?.error?.error_user_msg || err?.response?.data?.error?.message || err.message;
                throw new common_1.BadRequestException(`Meta rechazó la actualización del flow: ${msg}`);
            }
        }
        flow.transaccion = constants_1.Transacccion.ACTUALIZAR;
        flow.usuarioModificacion = usuarioModificacion;
        return this.flowRepository.save(flow);
    }
    async publicar(id, clienteId) {
        const flow = await this.obtener(id, clienteId);
        if (flow.estadoFlow === constants_1.EstadoFlowWhatsapp.PUBLICADO)
            return flow;
        const config = await this.waService.obtenerConfig(clienteId);
        try {
            await this.waService.publicarFlowMeta(config, flow.metaFlowId);
        }
        catch (err) {
            const msg = err?.response?.data?.error?.error_user_msg || err?.response?.data?.error?.message || err.message;
            flow.estadoFlow = constants_1.EstadoFlowWhatsapp.ERROR_VALIDACION;
            flow.erroresValidacion = msg;
            flow.transaccion = constants_1.Transacccion.ACTUALIZAR;
            await this.flowRepository.save(flow);
            throw new common_1.BadRequestException(`Meta rechazó la publicación: ${msg}`);
        }
        flow.estadoFlow = constants_1.EstadoFlowWhatsapp.PUBLICADO;
        flow.erroresValidacion = null;
        flow.transaccion = constants_1.Transacccion.ACTUALIZAR;
        return this.flowRepository.save(flow);
    }
    async sincronizarEstado(id, clienteId) {
        const flow = await this.obtener(id, clienteId);
        if (!flow.metaFlowId)
            return flow;
        const config = await this.waService.obtenerConfig(clienteId);
        const respuesta = await this.waService.obtenerEstadoFlowMeta(config, flow.metaFlowId);
        const mapaEstados = {
            DRAFT: constants_1.EstadoFlowWhatsapp.BORRADOR,
            PUBLISHED: constants_1.EstadoFlowWhatsapp.PUBLICADO,
            DEPRECATED: constants_1.EstadoFlowWhatsapp.OBSOLETO,
        };
        flow.estadoFlow = mapaEstados[respuesta.status] || flow.estadoFlow;
        flow.erroresValidacion = respuesta.validation_errors?.length ? JSON.stringify(respuesta.validation_errors) : null;
        flow.transaccion = constants_1.Transacccion.ACTUALIZAR;
        return this.flowRepository.save(flow);
    }
    async obtenerPreviewUrl(id, clienteId) {
        const flow = await this.obtener(id, clienteId);
        const config = await this.waService.obtenerConfig(clienteId);
        const { preview_url } = await this.waService.obtenerPreviewFlowMeta(config, flow.metaFlowId);
        return preview_url;
    }
    async eliminar(id, clienteId, usuarioModificacion) {
        const flow = await this.obtener(id, clienteId);
        try {
            const config = await this.waService.obtenerConfig(clienteId);
            if (flow.estadoFlow === constants_1.EstadoFlowWhatsapp.PUBLICADO) {
                await this.waService.deprecarFlowMeta(config, flow.metaFlowId);
            }
            else {
                await this.waService.eliminarFlowMeta(config, flow.metaFlowId);
            }
        }
        catch (err) {
            this.logger.warn(`No se pudo eliminar/deprecar el flow "${flow.nombre}" en Meta: ${err.message}`);
        }
        flow.estado = constants_1.Status.ELIMINATE;
        flow.transaccion = constants_1.Transacccion.ELIMINAR;
        flow.usuarioModificacion = usuarioModificacion;
        await this.flowRepository.save(flow);
    }
    obtenerScreenId() {
        return SCREEN_ID;
    }
    validarCampos(campos) {
        if (!campos?.length)
            throw new common_1.BadRequestException('El flow necesita al menos un campo');
        const conOpciones = ['Dropdown', 'RadioButtonsGroup', 'CheckboxGroup'];
        for (const campo of campos) {
            if (!campo.nombre?.trim() || !campo.etiqueta?.trim()) {
                throw new common_1.BadRequestException('Todos los campos necesitan nombre interno y etiqueta visible');
            }
            if (conOpciones.includes(campo.tipo) && !campo.opciones?.length) {
                throw new common_1.BadRequestException(`El campo "${campo.etiqueta}" (${campo.tipo}) necesita al menos una opción`);
            }
        }
    }
    construirFlowJson(campos, screenTitle) {
        const hijos = campos.map(campo => {
            const base = { type: campo.tipo, name: campo.nombre, label: campo.etiqueta, required: campo.requerido };
            if (campo.tipo === 'TextInput')
                base['input-type'] = campo.inputType || 'text';
            if (['Dropdown', 'RadioButtonsGroup', 'CheckboxGroup'].includes(campo.tipo)) {
                base['data-source'] = (campo.opciones || []).map(o => ({ id: o, title: o }));
            }
            return base;
        });
        hijos.push({
            type: 'Footer',
            label: 'Enviar',
            'on-click-action': { name: 'complete', payload: {} },
        });
        const json = {
            version: '5.1',
            screens: [
                {
                    id: SCREEN_ID,
                    title: screenTitle,
                    terminal: true,
                    success: true,
                    data: {},
                    layout: {
                        type: 'SingleColumnLayout',
                        children: [
                            { type: 'Form', name: 'form', children: hijos },
                        ],
                    },
                },
            ],
        };
        return JSON.stringify(json);
    }
};
FlowWhatsappService = FlowWhatsappService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(flow_whatsapp_entity_1.FlowWhatsapp)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        whatsapp_service_1.WhatsappService])
], FlowWhatsappService);
exports.FlowWhatsappService = FlowWhatsappService;
//# sourceMappingURL=flow-whatsapp.service.js.map