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
var ConversacionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversacionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conversacion_entity_1 = require("../entity/conversacion.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
let ConversacionService = ConversacionService_1 = class ConversacionService extends base_service_1.BaseService {
    constructor(conversacionRepository) {
        super(ConversacionService_1.name);
        this.conversacionRepository = conversacionRepository;
    }
    async listar(clienteId, agenteId) {
        const where = { estado: constants_1.Status.ACTIVE };
        if (clienteId)
            where.clienteId = clienteId;
        if (agenteId)
            where.agenteId = agenteId;
        return this.conversacionRepository.find({
            where,
            order: { fechaCreacion: 'DESC' },
            take: 100,
        });
    }
    async obtener(id) {
        const conv = await this.conversacionRepository.findOne({ where: { id, estado: constants_1.Status.ACTIVE } });
        if (!conv)
            throw new common_1.NotFoundException(response_messages_1.Messages.CONVERSACION_NOT_FOUND);
        return conv;
    }
    async obtenerPorClienteId(id, clienteId) {
        const conv = await this.conversacionRepository.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!conv)
            throw new common_1.NotFoundException(response_messages_1.Messages.CONVERSACION_NOT_FOUND);
        return conv;
    }
    async crear(dto, usuarioCreacion, clienteId) {
        const conv = this.conversacionRepository.create({
            ...dto,
            clienteId,
            canal: dto.canal || 'chat',
            estadoConversacion: 'abierto',
            mensajes: [],
            etiquetas: dto.etiquetas ?? [],
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.conversacionRepository.save(conv);
    }
    async agregarMensaje(id, dto) {
        const conv = await this.obtener(id);
        const nuevoMensaje = {
            role: dto.role,
            content: dto.content,
            timestamp: new Date().toISOString(),
        };
        conv.mensajes = [...(conv.mensajes || []), nuevoMensaje];
        conv.totalMensajes = conv.mensajes.length;
        conv.transaccion = constants_1.Transacccion.ACTUALIZAR;
        return this.conversacionRepository.save(conv);
    }
    async actualizarScore(id, score) {
        await this.conversacionRepository.update(id, { score });
    }
    async actualizarEstado(id, estadoConversacion) {
        await this.conversacionRepository.update(id, { estadoConversacion });
    }
    async escalar(id, razon) {
        const conv = await this.obtener(id);
        conv.escalado = true;
        conv.estadoConversacion = 'pendiente';
        if (razon) {
            conv.notas = conv.notas ? `${conv.notas}\n[ESCALADO] ${razon}` : `[ESCALADO] ${razon}`;
        }
        conv.transaccion = constants_1.Transacccion.ACTUALIZAR;
        await this.conversacionRepository.save(conv);
    }
    async agregarNota(id, nota) {
        const conv = await this.obtener(id);
        const ts = new Date().toISOString();
        conv.notas = conv.notas ? `${conv.notas}\n[${ts}] ${nota}` : `[${ts}] ${nota}`;
        conv.transaccion = constants_1.Transacccion.ACTUALIZAR;
        await this.conversacionRepository.save(conv);
    }
    async actualizarNotas(id, notas) {
        const conv = await this.obtener(id);
        conv.notas = notas;
        conv.transaccion = constants_1.Transacccion.ACTUALIZAR;
        return this.conversacionRepository.save(conv);
    }
    async actualizarAgente(id, agenteId) {
        const conv = await this.obtener(id);
        if (agenteId) {
            conv.agenteId = String(parseInt(agenteId, 10));
        }
        else {
            conv.agenteId = null;
        }
        conv.transaccion = constants_1.Transacccion.ACTUALIZAR;
        return this.conversacionRepository.save(conv);
    }
    async actualizarEtiquetas(id, etiquetas) {
        const conv = await this.obtener(id);
        conv.etiquetas = Array.isArray(etiquetas) ? etiquetas : [];
        conv.transaccion = constants_1.Transacccion.ACTUALIZAR;
        return this.conversacionRepository.save(conv);
    }
    async estadisticas(clienteId, agenteId) {
        const where = { estado: constants_1.Status.ACTIVE };
        if (clienteId)
            where.clienteId = clienteId;
        if (agenteId)
            where.agenteId = agenteId;
        const qb = this.conversacionRepository.createQueryBuilder('c')
            .where('c.estado = :estado', { estado: constants_1.Status.ACTIVE });
        if (clienteId)
            qb.andWhere('c.cliente_id = :clienteId', { clienteId });
        if (agenteId)
            qb.andWhere('c.agente_id = :agenteId', { agenteId });
        const [total, escaladas, resueltas, abiertas] = await Promise.all([
            this.conversacionRepository.count({ where }),
            this.conversacionRepository.count({ where: { ...where, escalado: true } }),
            this.conversacionRepository.count({ where: { ...where, estadoConversacion: 'resuelto' } }),
            this.conversacionRepository.count({ where: { ...where, estadoConversacion: 'abierto' } }),
        ]);
        const msgResult = await qb.clone()
            .select('COALESCE(SUM(c.total_mensajes), 0)', 'sum')
            .getRawOne();
        const totalMensajes = parseInt(msgResult?.sum || '0', 10);
        const hotLeads = await qb.clone()
            .andWhere('c.score >= 70').getCount();
        const warmLeads = await qb.clone()
            .andWhere('c.score >= 40').andWhere('c.score < 70').getCount();
        const coldLeads = await qb.clone()
            .andWhere('c.score < 40').getCount();
        const canalRows = await qb.clone()
            .select('c.canal', 'canal')
            .addSelect('COUNT(*)', 'cnt')
            .groupBy('c.canal')
            .getRawMany();
        const porCanal = {};
        for (const row of canalRows)
            porCanal[row.canal] = parseInt(row.cnt, 10);
        return {
            total,
            escaladas,
            resueltas,
            abiertas,
            totalMensajes,
            hotLeads,
            warmLeads,
            coldLeads,
            porCanal,
            porcentajeResolucion: total > 0 ? Math.round((resueltas / total) * 100) : 0,
        };
    }
};
ConversacionService = ConversacionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversacion_entity_1.Conversacion)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ConversacionService);
exports.ConversacionService = ConversacionService;
//# sourceMappingURL=conversacion.service.js.map