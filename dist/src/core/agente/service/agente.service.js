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
var AgenteService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgenteService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const axios_1 = __importDefault(require("axios"));
const agente_entity_1 = require("../entity/agente.entity");
const herramienta_entity_1 = require("../../herramienta/entity/herramienta.entity");
const herramienta_defaults_1 = require("../../herramienta/herramienta.defaults");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
const configuracion_cliente_service_1 = require("../../cliente/service/configuracion-cliente.service");
const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
let AgenteService = AgenteService_1 = class AgenteService extends base_service_1.BaseService {
    constructor(agenteRepository, herramientaRepository, configuracionClienteService) {
        super(AgenteService_1.name);
        this.agenteRepository = agenteRepository;
        this.herramientaRepository = herramientaRepository;
        this.configuracionClienteService = configuracionClienteService;
    }
    async listar(clienteId) {
        return this.agenteRepository.find({
            where: { estado: constants_1.Status.ACTIVE, clienteId },
            order: { fechaCreacion: 'DESC' },
        });
    }
    async obtener(id, clienteId) {
        const agente = await this.agenteRepository.findOne({ where: { id, estado: constants_1.Status.ACTIVE, clienteId } });
        if (!agente)
            throw new common_1.NotFoundException(response_messages_1.Messages.AGENTE_NOT_FOUND);
        return agente;
    }
    async crear(dto, usuarioCreacion, clienteId) {
        const agente = this.agenteRepository.create({
            ...dto,
            clienteId,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
            activo: true,
        });
        const guardado = await this.agenteRepository.save(agente);
        try {
            await this.sembrarHerramientasPorDefecto(guardado.id, usuarioCreacion);
        }
        catch (err) {
            this.logger.error(`No se pudieron sembrar las herramientas del agente ${guardado.id}: ${err.message}`);
        }
        return guardado;
    }
    async sembrarHerramientasPorDefecto(agenteId, usuarioCreacion) {
        const filas = herramienta_defaults_1.HERRAMIENTAS_DEFAULT.map(d => this.herramientaRepository.create({
            ...d,
            agenteId,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        }));
        await this.herramientaRepository.save(filas);
    }
    async actualizar(id, dto, usuarioModificacion, clienteId) {
        const agente = await this.obtener(id, clienteId);
        Object.assign(agente, { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.agenteRepository.save(agente);
    }
    async eliminar(id, usuarioModificacion, clienteId) {
        const agente = await this.obtener(id, clienteId);
        agente.estado = constants_1.Status.ELIMINATE;
        agente.transaccion = constants_1.Transacccion.ELIMINAR;
        agente.usuarioModificacion = usuarioModificacion;
        await this.agenteRepository.save(agente);
    }
    async incrementarContadores(id, mensajes = 1) {
        await this.agenteRepository.increment({ id }, 'totalMensajes', mensajes);
    }
    async testConAgente(id, mensaje, historial = [], clienteId) {
        const agente = await this.obtener(id, clienteId);
        const apiKeyConfig = await this.configuracionClienteService.obtenerPorClave(clienteId, 'ANTHROPIC_API_KEY');
        const apiKey = apiKeyConfig?.valor;
        if (!apiKey || apiKey.includes('•')) {
            throw new Error('API Key de Anthropic no configurada. Ve a Configuración para agregarla.');
        }
        const messages = [
            ...historial,
            { role: 'user', content: mensaje },
        ];
        const systemPrompt = agente.systemPrompt ||
            `Eres ${agente.nombre}, un asistente IA ${agente.tono || 'profesional'}. Responde en ${agente.idioma || 'español'} de forma concisa y útil.`;
        const res = await axios_1.default.post(ANTHROPIC_API, {
            model: agente.modelo || 'claude-haiku-4-5',
            max_tokens: agente.maxTokens || 256,
            system: systemPrompt,
            messages,
        }, {
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
        });
        const respuesta = res.data?.content?.[0]?.text || 'Sin respuesta';
        return { respuesta, modelo: agente.modelo };
    }
};
AgenteService = AgenteService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agente_entity_1.Agente)),
    __param(1, (0, typeorm_1.InjectRepository)(herramienta_entity_1.Herramienta)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        configuracion_cliente_service_1.ConfiguracionClienteService])
], AgenteService);
exports.AgenteService = AgenteService;
//# sourceMappingURL=agente.service.js.map