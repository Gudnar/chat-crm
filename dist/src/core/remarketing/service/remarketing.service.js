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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RemarketingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemarketingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const axios_1 = __importDefault(require("axios"));
const campana_remarketing_entity_1 = require("../entity/campana-remarketing.entity");
const envio_remarketing_entity_1 = require("../entity/envio-remarketing.entity");
const conversacion_entity_1 = require("../../conversacion/entity/conversacion.entity");
const whatsapp_service_1 = require("../../whatsapp/service/whatsapp.service");
const configuracion_cliente_service_1 = require("../../cliente/service/configuracion-cliente.service");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
let RemarketingService = RemarketingService_1 = class RemarketingService extends base_service_1.BaseService {
    constructor(campanaRepo, envioRepo, convRepo, whatsappService, confClienteService) {
        super(RemarketingService_1.name);
        this.campanaRepo = campanaRepo;
        this.envioRepo = envioRepo;
        this.convRepo = convRepo;
        this.whatsappService = whatsappService;
        this.confClienteService = confClienteService;
    }
    async procesarCampanasProgramadas() {
        try {
            const pendientes = await this.campanaRepo.find({
                where: {
                    estadoCampana: 'pendiente',
                    programadoEn: (0, typeorm_2.LessThanOrEqual)(new Date()),
                    estado: constants_1.Status.ACTIVE,
                },
            });
            for (const campana of pendientes) {
                await this._ejecutar(campana).catch(e => this.logger.error(`Error ejecutando campaña ${campana.id}: ${e.message}`));
            }
        }
        catch (e) {
            this.logger.error(`Cron remarketing error: ${e.message}`);
        }
    }
    async listarCampanas(clienteId) {
        const campanas = await this.campanaRepo.find({
            where: { clienteId, estado: constants_1.Status.ACTIVE },
            order: { programadoEn: 'DESC' },
        });
        const result = await Promise.all(campanas.map(async (c) => ({
            ...c,
            totalContactos: await this.envioRepo.count({ where: { campanaId: c.id } }),
        })));
        return result;
    }
    async obtenerCampana(id, clienteId) {
        const campana = await this.campanaRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!campana)
            throw new common_1.NotFoundException('Campaña no encontrada');
        const envios = await this.envioRepo.find({
            where: { campanaId: id },
            order: { scoreAlEnvio: 'DESC' },
        });
        return { ...campana, envios };
    }
    async crearCampana(dto, userId, clienteId) {
        const campana = this.campanaRepo.create({
            ...dto,
            programadoEn: new Date(dto.programadoEn),
            scoreMin: dto.scoreMin ?? 0,
            scoreMax: dto.scoreMax ?? 100,
            canalObjetivo: dto.canalObjetivo ?? 'whatsapp',
            estadoCampana: 'pendiente',
            clienteId,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion: userId,
        });
        return this.campanaRepo.save(campana);
    }
    async cancelarCampana(id, userId, clienteId) {
        const campana = await this.campanaRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!campana)
            throw new common_1.NotFoundException('Campaña no encontrada');
        if (campana.estadoCampana !== 'pendiente') {
            throw new common_1.BadRequestException('Solo se pueden cancelar campañas pendientes');
        }
        campana.estadoCampana = 'cancelado';
        campana.transaccion = constants_1.Transacccion.ACTUALIZAR;
        campana.usuarioModificacion = userId;
        await this.campanaRepo.save(campana);
    }
    async eliminarCampana(id, userId, clienteId) {
        const campana = await this.campanaRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!campana)
            throw new common_1.NotFoundException('Campaña no encontrada');
        if (campana.estadoCampana === 'ejecutando') {
            throw new common_1.BadRequestException('No se puede eliminar una campaña en ejecución');
        }
        campana.estado = constants_1.Status.ELIMINATE;
        campana.transaccion = constants_1.Transacccion.ELIMINAR;
        campana.usuarioModificacion = userId;
        await this.campanaRepo.save(campana);
    }
    async ejecutarCampanaAhora(id, clienteId) {
        const campana = await this.campanaRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!campana)
            throw new common_1.NotFoundException('Campaña no encontrada');
        if (!['pendiente', 'cancelado'].includes(campana.estadoCampana)) {
            throw new common_1.BadRequestException('La campaña ya fue ejecutada o está en ejecución');
        }
        campana.estadoCampana = 'pendiente';
        await this.campanaRepo.save(campana);
        await this._ejecutar(campana);
    }
    async _ejecutar(campana) {
        await this.campanaRepo.update(campana.id, { estadoCampana: 'ejecutando' });
        try {
            const waConfig = await this.whatsappService.obtenerConfig(campana.clienteId);
            if (!waConfig.accessToken || !waConfig.phoneNumberId) {
                throw new Error('WhatsApp no configurado para este cliente');
            }
            const conversaciones = await this.convRepo
                .createQueryBuilder('c')
                .where('c.estado = :estado', { estado: constants_1.Status.ACTIVE })
                .andWhere('c.cliente_id = :clienteId', { clienteId: campana.clienteId })
                .andWhere('c.total_mensajes > 0')
                .andWhere('c.score >= :scoreMin', { scoreMin: campana.scoreMin })
                .andWhere('c.score <= :scoreMax', { scoreMax: campana.scoreMax })
                .andWhere('c.canal = :canal', { canal: campana.canalObjetivo })
                .orderBy('c.score', 'DESC')
                .getMany();
            const contactoMap = new Map();
            for (const conv of conversaciones) {
                if (!contactoMap.has(conv.contacto) || conv.score > contactoMap.get(conv.contacto).score) {
                    contactoMap.set(conv.contacto, conv);
                }
            }
            const targets = Array.from(contactoMap.values()).sort((a, b) => b.score - a.score);
            let apiKey;
            if (campana.tipoMensaje === 'ia') {
                const keyConf = await this.confClienteService.obtenerPorClave(campana.clienteId, 'ANTHROPIC_API_KEY');
                apiKey = keyConf?.valor;
            }
            let totalEnviados = 0;
            let totalErrores = 0;
            for (const conv of targets) {
                const envio = this.envioRepo.create({
                    campanaId: campana.id,
                    conversacionId: conv.id,
                    contacto: conv.contacto,
                    scoreAlEnvio: conv.score,
                    estadoEnvio: 'pendiente',
                    clienteId: campana.clienteId,
                    estado: constants_1.Status.ACTIVE,
                    transaccion: constants_1.Transacccion.CREAR,
                    usuarioCreacion: campana.usuarioCreacion,
                });
                const envioGuardado = await this.envioRepo.save(envio);
                try {
                    let mensajeFinal;
                    if (campana.tipoMensaje === 'ia' && apiKey) {
                        mensajeFinal = await this._generarMensajeIA(conv, campana.mensaje, apiKey);
                    }
                    else {
                        mensajeFinal = campana.mensaje.replace(/\{contacto\}/gi, conv.contacto);
                    }
                    await this.whatsappService.enviarTexto(conv.contacto, mensajeFinal, waConfig);
                    await this.envioRepo.update(envioGuardado.id, {
                        estadoEnvio: 'enviado',
                        mensajeEnviado: mensajeFinal,
                        enviadoEn: new Date(),
                    });
                    totalEnviados++;
                }
                catch (err) {
                    await this.envioRepo.update(envioGuardado.id, {
                        estadoEnvio: 'error',
                        error: err.message?.slice(0, 500),
                    });
                    totalErrores++;
                }
            }
            await this.campanaRepo.update(campana.id, {
                estadoCampana: 'completado',
                ejecutadoEn: new Date(),
                totalEnviados,
                totalErrores,
            });
        }
        catch (err) {
            this.logger.error(`Error en ejecución campaña ${campana.id}: ${err.message}`);
            await this.campanaRepo.update(campana.id, {
                estadoCampana: 'cancelado',
                totalErrores: 1,
            });
            throw err;
        }
    }
    async _generarMensajeIA(conv, objetivo, apiKey) {
        const historial = conv.mensajes
            .slice(-10)
            .map(m => `${m.role === 'user' ? 'Cliente' : 'Agente'}: ${m.content}`)
            .join('\n');
        const systemPrompt = `Eres un experto en marketing conversacional.
Basándote en el historial de conversación, redacta un mensaje de remarketing corto,
personalizado y persuasivo para este lead. El objetivo de la campaña es: "${objetivo}".
Responde ÚNICAMENTE con el texto del mensaje, sin comillas ni explicaciones.`;
        const res = await axios_1.default.post(ANTHROPIC_API, {
            model: 'claude-haiku-4-5',
            max_tokens: 300,
            system: systemPrompt,
            messages: [{ role: 'user', content: `Historial:\n${historial}\n\nContacto: ${conv.contacto}` }],
        }, {
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
        });
        return res.data?.content?.[0]?.text?.trim() || objetivo;
    }
};
__decorate([
    (0, schedule_1.Cron)('* * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RemarketingService.prototype, "procesarCampanasProgramadas", null);
RemarketingService = RemarketingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(campana_remarketing_entity_1.CampanaRemarketing)),
    __param(1, (0, typeorm_1.InjectRepository)(envio_remarketing_entity_1.EnvioRemarketing)),
    __param(2, (0, typeorm_1.InjectRepository)(conversacion_entity_1.Conversacion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        whatsapp_service_1.WhatsappService,
        configuracion_cliente_service_1.ConfiguracionClienteService])
], RemarketingService);
exports.RemarketingService = RemarketingService;
//# sourceMappingURL=remarketing.service.js.map