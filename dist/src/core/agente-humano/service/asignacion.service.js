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
var AsignacionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsignacionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conversacion_entity_1 = require("../../conversacion/entity/conversacion.entity");
const agente_entity_1 = require("../../agente/entity/agente.entity");
const asignacion_agente_humano_entity_1 = require("../entity/asignacion-agente-humano.entity");
const agente_humano_service_1 = require("./agente-humano.service");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
let AsignacionService = AsignacionService_1 = class AsignacionService extends base_service_1.BaseService {
    constructor(conversacionRepository, agenteRepository, asignacionRepository, agenteHumanoService) {
        super(AsignacionService_1.name);
        this.conversacionRepository = conversacionRepository;
        this.agenteRepository = agenteRepository;
        this.asignacionRepository = asignacionRepository;
        this.agenteHumanoService = agenteHumanoService;
    }
    async asignar(dto, asignadoPor, clienteId) {
        const conversacion = await this.conversacionRepository.findOne({
            where: { id: dto.conversacionId, clienteId, estado: constants_1.Status.ACTIVE },
        });
        if (!conversacion)
            throw new common_1.NotFoundException('La conversación no fue encontrada.');
        const agente = await this.agenteRepository.findOne({
            where: { id: dto.agenteHumanoId, clienteId, tipoAgente: constants_1.TipoAgente.HUMANO, activo: true, estado: constants_1.Status.ACTIVE },
        });
        if (!agente)
            throw new common_1.NotFoundException('El agente humano no fue encontrado o está inactivo.');
        if (conversacion.agenteHumanoId && conversacion.agenteHumanoId !== dto.agenteHumanoId) {
            await this.asignacionRepository.update({ conversacionId: conversacion.id, estadoAsignacion: 'activa' }, { estadoAsignacion: 'reasignada', fechaCierre: new Date(), transaccion: constants_1.Transacccion.ACTUALIZAR });
        }
        const asignacion = this.asignacionRepository.create({
            conversacionId: conversacion.id,
            agenteHumanoId: agente.id,
            asignadoPor,
            razonAsignacion: dto.razon,
            fueEscalada: dto.esEscalada ?? false,
            estadoAsignacion: 'activa',
            clienteId,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion: asignadoPor,
        });
        await this.asignacionRepository.save(asignacion);
        conversacion.agenteHumanoId = agente.id;
        conversacion.tipoAgenteAsignado = constants_1.TipoAgente.HUMANO;
        conversacion.fechaAsignacionHumano = new Date();
        if (dto.esEscalada)
            conversacion.escalado = true;
        if (conversacion.estadoConversacion === constants_1.EstadoConversacion.RESUELTO) {
            conversacion.estadoConversacion = constants_1.EstadoConversacion.ABIERTO;
        }
        conversacion.transaccion = constants_1.Transacccion.ACTUALIZAR;
        await this.conversacionRepository.save(conversacion);
        await this.agenteHumanoService.registrarActividad(agente.id, clienteId, dto.esEscalada ? constants_1.TipoActividadAgente.ESCALADA : constants_1.TipoActividadAgente.ASIGNACION, { razon: dto.razon, asignadoPor }, conversacion.id);
        this.logger.log(`Conversación ${conversacion.id} asignada al agente humano ${agente.nombre}`);
        return { conversacionId: conversacion.id, agenteHumanoId: agente.id, agenteNombre: agente.nombre };
    }
    async misConversaciones(agenteHumanoId, clienteId) {
        return this.conversacionRepository.find({
            where: { agenteHumanoId, clienteId, estado: constants_1.Status.ACTIVE },
            order: { fechaCreacion: 'DESC' },
            take: 100,
        });
    }
    async cerrar(conversacionId, dto, actor, clienteId) {
        const conversacion = await this.conversacionRepository.findOne({
            where: { id: conversacionId, clienteId, estado: constants_1.Status.ACTIVE },
        });
        if (!conversacion)
            throw new common_1.NotFoundException('La conversación no fue encontrada.');
        if (actor.agenteHumanoId && conversacion.agenteHumanoId !== actor.agenteHumanoId) {
            throw new common_1.ForbiddenException('Solo puedes cerrar conversaciones asignadas a ti.');
        }
        conversacion.estadoConversacion = constants_1.EstadoConversacion.RESUELTO;
        if (dto.resolucion)
            conversacion.resolucion = dto.resolucion;
        conversacion.transaccion = constants_1.Transacccion.ACTUALIZAR;
        await this.conversacionRepository.save(conversacion);
        const asignacion = await this.asignacionRepository.findOne({
            where: { conversacionId, estadoAsignacion: 'activa', estado: constants_1.Status.ACTIVE },
            order: { fechaAsignacion: 'DESC' },
        });
        if (asignacion) {
            const ahora = new Date();
            asignacion.estadoAsignacion = 'cerrada';
            asignacion.fechaCierre = ahora;
            asignacion.tiempoAtencionSegundos = Math.round((ahora.getTime() - new Date(asignacion.fechaAsignacion).getTime()) / 1000);
            asignacion.transaccion = constants_1.Transacccion.ACTUALIZAR;
            await this.asignacionRepository.save(asignacion);
            await this.agenteHumanoService.registrarActividad(asignacion.agenteHumanoId, clienteId, constants_1.TipoActividadAgente.CIERRE, { resolucion: dto.resolucion, tiempoSegundos: asignacion.tiempoAtencionSegundos }, conversacionId);
        }
        return { conversacionId, estadoConversacion: constants_1.EstadoConversacion.RESUELTO };
    }
    async devolverAIa(conversacionId, actor, clienteId) {
        const conversacion = await this.conversacionRepository.findOne({
            where: { id: conversacionId, clienteId, estado: constants_1.Status.ACTIVE },
        });
        if (!conversacion)
            throw new common_1.NotFoundException('La conversación no fue encontrada.');
        if (actor.agenteHumanoId && conversacion.agenteHumanoId !== actor.agenteHumanoId) {
            throw new common_1.ForbiddenException('Solo puedes liberar conversaciones asignadas a ti.');
        }
        const agenteHumanoAnterior = conversacion.agenteHumanoId;
        await this.asignacionRepository.update({ conversacionId, estadoAsignacion: 'activa' }, { estadoAsignacion: 'cerrada', fechaCierre: new Date(), transaccion: constants_1.Transacccion.ACTUALIZAR });
        conversacion.agenteHumanoId = null;
        conversacion.tipoAgenteAsignado = constants_1.TipoAgente.IA;
        conversacion.escalado = false;
        conversacion.transaccion = constants_1.Transacccion.ACTUALIZAR;
        await this.conversacionRepository.save(conversacion);
        if (agenteHumanoAnterior) {
            await this.agenteHumanoService.registrarActividad(agenteHumanoAnterior, clienteId, constants_1.TipoActividadAgente.REASIGNACION, { accion: 'devuelta_a_ia' }, conversacionId);
        }
        return { conversacionId, tipoAgenteAsignado: constants_1.TipoAgente.IA };
    }
    async colaSinAsignar(clienteId) {
        return this.conversacionRepository.find({
            where: [
                { clienteId, estado: constants_1.Status.ACTIVE, escalado: true, agenteHumanoId: (0, typeorm_2.IsNull)() },
                { clienteId, estado: constants_1.Status.ACTIVE, agenteId: (0, typeorm_2.IsNull)(), agenteHumanoId: (0, typeorm_2.IsNull)(), estadoConversacion: constants_1.EstadoConversacion.ABIERTO },
            ],
            order: { fechaCreacion: 'ASC' },
            take: 50,
        });
    }
    async asignacionAutomatica(asignadoPor, clienteId) {
        const cola = await this.colaSinAsignar(clienteId);
        if (cola.length === 0)
            return { asignadas: 0, mensaje: 'No hay conversaciones en cola.' };
        const disponibles = await this.agenteRepository.find({
            where: {
                clienteId,
                tipoAgente: constants_1.TipoAgente.HUMANO,
                estadoDisponibilidad: constants_1.DisponibilidadAgente.DISPONIBLE,
                activo: true,
                estado: constants_1.Status.ACTIVE,
            },
        });
        if (disponibles.length === 0)
            return { asignadas: 0, mensaje: 'No hay agentes disponibles.' };
        const carga = await Promise.all(disponibles.map(async (agente) => ({
            agente,
            activas: await this.asignacionRepository.count({
                where: { agenteHumanoId: agente.id, estadoAsignacion: 'activa', estado: constants_1.Status.ACTIVE },
            }),
        })));
        let asignadas = 0;
        for (const conversacion of cola) {
            carga.sort((a, b) => a.activas - b.activas);
            const destino = carga[0];
            await this.asignar({
                conversacionId: conversacion.id,
                agenteHumanoId: destino.agente.id,
                razon: 'Asignación automática por balanceo de carga',
                esEscalada: conversacion.escalado,
            }, asignadoPor, clienteId);
            destino.activas += 1;
            asignadas += 1;
        }
        return { asignadas, agentesUsados: carga.filter(c => c.activas > 0).length };
    }
};
AsignacionService = AsignacionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversacion_entity_1.Conversacion)),
    __param(1, (0, typeorm_1.InjectRepository)(agente_entity_1.Agente)),
    __param(2, (0, typeorm_1.InjectRepository)(asignacion_agente_humano_entity_1.AsignacionAgenteHumano)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        agente_humano_service_1.AgenteHumanoService])
], AsignacionService);
exports.AsignacionService = AsignacionService;
//# sourceMappingURL=asignacion.service.js.map