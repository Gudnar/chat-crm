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
var CalificacionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalificacionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const axios_1 = __importDefault(require("axios"));
const conversacion_entity_1 = require("../entity/conversacion.entity");
const configuracion_cliente_service_1 = require("../../cliente/service/configuracion-cliente.service");
const cliente_service_1 = require("../../cliente/service/cliente.service");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const DEFAULT_PROMPT = `Analiza la siguiente conversación y califica este lead del 0 al 100 según:
- Intención de compra (30 pts): menciona comprar, contratar o adquirir
- Presupuesto disponible (20 pts): indica cuánto puede invertir
- Urgencia (20 pts): necesita resolverlo pronto o tiene fecha límite
- Autoridad (15 pts): es quien toma la decisión de compra
- Perfil ideal (15 pts): coincide con el cliente objetivo

Responde ÚNICAMENTE con un JSON válido: { "score": número_entre_0_y_100, "motivo": "explicación breve en una línea" }`;
let CalificacionService = CalificacionService_1 = class CalificacionService extends base_service_1.BaseService {
    constructor(convRepo, confClienteService, clienteService) {
        super(CalificacionService_1.name);
        this.convRepo = convRepo;
        this.confClienteService = confClienteService;
        this.clienteService = clienteService;
    }
    async cronCalificar() {
        try {
            const clientes = await this.clienteService.listar();
            for (const cliente of clientes) {
                await this.calificarLote(cliente.id).catch(e => this.logger.warn(`Cron calificacion cliente ${cliente.id}: ${e.message}`));
            }
        }
        catch (e) {
            this.logger.error(`Cron calificacion error: ${e.message}`);
        }
    }
    async calificarLote(clienteId) {
        const qb = this.convRepo.createQueryBuilder('c')
            .where('c.estado = :estado', { estado: constants_1.Status.ACTIVE })
            .andWhere('c.cliente_id = :clienteId', { clienteId })
            .andWhere('c.total_mensajes > 0')
            .andWhere('(c.ultima_calificacion IS NULL OR c.fecha_modificacion > c.ultima_calificacion)')
            .orderBy('c.score', 'DESC')
            .take(50);
        const conversaciones = await qb.getMany();
        let calificadas = 0;
        let errores = 0;
        for (const conv of conversaciones) {
            try {
                await this.calificarConIA(conv.id, clienteId);
                calificadas++;
            }
            catch {
                errores++;
            }
        }
        return { calificadas, errores };
    }
    async calificarConIA(conversacionId, clienteId) {
        const conv = await this.convRepo.findOne({
            where: { id: conversacionId, clienteId, estado: constants_1.Status.ACTIVE },
        });
        if (!conv)
            throw new Error('Conversación no encontrada');
        if (!conv.mensajes?.length)
            throw new Error('La conversación no tiene mensajes');
        const apiKeyConf = await this.confClienteService.obtenerPorClave(clienteId, 'ANTHROPIC_API_KEY');
        const apiKey = apiKeyConf?.valor;
        if (!apiKey)
            throw new Error('API key de Anthropic no configurada');
        const promptConf = await this.confClienteService.obtenerPorClave(clienteId, 'CALIFICACION_PROMPT');
        const systemPrompt = promptConf?.valor || DEFAULT_PROMPT;
        const mensajesTexto = conv.mensajes
            .slice(-20)
            .map(m => `${m.role === 'user' ? 'Cliente' : 'Agente'}: ${m.content}`)
            .join('\n');
        const res = await axios_1.default.post(ANTHROPIC_API, {
            model: 'claude-haiku-4-5',
            max_tokens: 256,
            system: systemPrompt,
            messages: [{ role: 'user', content: `Conversación a calificar:\n\n${mensajesTexto}` }],
        }, {
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
        });
        const texto = res.data?.content?.[0]?.text || '{}';
        let score = 0;
        let motivo = '';
        try {
            const match = texto.match(/\{[\s\S]*\}/);
            const parsed = JSON.parse(match ? match[0] : texto);
            score = Math.min(100, Math.max(0, Number(parsed.score) || 0));
            motivo = String(parsed.motivo || '').slice(0, 500);
        }
        catch {
            this.logger.warn(`No se pudo parsear respuesta de calificacion: ${texto}`);
        }
        await this.convRepo.update(conv.id, {
            score,
            motivoScore: motivo,
            ultimaCalificacion: new Date(),
        });
        return { score, motivo };
    }
    async obtenerConfig(clienteId) {
        const [promptConf, criteriosConf, umbralesConf] = await Promise.all([
            this.confClienteService.obtenerPorClave(clienteId, 'CALIFICACION_PROMPT'),
            this.confClienteService.obtenerPorClave(clienteId, 'CALIFICACION_CRITERIOS'),
            this.confClienteService.obtenerPorClave(clienteId, 'CALIFICACION_UMBRALES'),
        ]);
        return {
            prompt: promptConf?.valor || '',
            criterios: criteriosConf?.valor ? JSON.parse(criteriosConf.valor) : null,
            umbrales: umbralesConf?.valor ? JSON.parse(umbralesConf.valor) : null,
        };
    }
    async guardarConfig(clienteId, config, userId) {
        const tareas = [];
        if (config.prompt !== undefined) {
            tareas.push(this.confClienteService.set(clienteId, {
                clave: 'CALIFICACION_PROMPT', valor: config.prompt, esSecreto: false, descripcion: 'Prompt de calificación IA',
            }, userId));
        }
        if (config.criterios !== undefined) {
            tareas.push(this.confClienteService.set(clienteId, {
                clave: 'CALIFICACION_CRITERIOS', valor: JSON.stringify(config.criterios), esSecreto: false, descripcion: 'Criterios de calificación',
            }, userId));
        }
        if (config.umbrales !== undefined) {
            tareas.push(this.confClienteService.set(clienteId, {
                clave: 'CALIFICACION_UMBRALES', valor: JSON.stringify(config.umbrales), esSecreto: false, descripcion: 'Umbrales de lead scoring',
            }, userId));
        }
        await Promise.all(tareas);
    }
};
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CalificacionService.prototype, "cronCalificar", null);
CalificacionService = CalificacionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversacion_entity_1.Conversacion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        configuracion_cliente_service_1.ConfiguracionClienteService,
        cliente_service_1.ClienteService])
], CalificacionService);
exports.CalificacionService = CalificacionService;
//# sourceMappingURL=calificacion.service.js.map