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
var ExcepcionHorarioAgenteService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcepcionHorarioAgenteService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const excepcion_horario_agente_entity_1 = require("../entity/excepcion-horario-agente.entity");
const agente_service_1 = require("../../agente/service/agente.service");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
let ExcepcionHorarioAgenteService = ExcepcionHorarioAgenteService_1 = class ExcepcionHorarioAgenteService extends base_service_1.BaseService {
    constructor(excepcionRepository, agenteService) {
        super(ExcepcionHorarioAgenteService_1.name);
        this.excepcionRepository = excepcionRepository;
        this.agenteService = agenteService;
    }
    async listar(clienteId, filtros) {
        const qb = this.excepcionRepository
            .createQueryBuilder('e')
            .where('e.clienteId = :clienteId', { clienteId })
            .andWhere('e.estado = :estado', { estado: constants_1.Status.ACTIVE })
            .orderBy('e.fechaInicio', 'ASC');
        if (filtros?.agenteId)
            qb.andWhere('e.agenteId = :agenteId', { agenteId: filtros.agenteId });
        return qb.getMany();
    }
    async listarEnRango(clienteId, desde, hasta, agenteId) {
        const qb = this.excepcionRepository
            .createQueryBuilder('e')
            .where('e.clienteId = :clienteId', { clienteId })
            .andWhere('e.estado = :estado', { estado: constants_1.Status.ACTIVE })
            .andWhere('e.fechaInicio <= :hasta', { hasta })
            .andWhere('e.fechaFin >= :desde', { desde })
            .orderBy('e.fechaInicio', 'ASC');
        if (agenteId) {
            qb.andWhere('(e.agenteId IS NULL OR e.agenteId = :agenteId)', { agenteId });
        }
        else {
            qb.andWhere('e.agenteId IS NULL');
        }
        return qb.getMany();
    }
    async estaBloqueada(agenteId, clienteId, fecha) {
        const excepciones = await this.listarEnRango(clienteId, fecha, fecha, agenteId);
        const diaCompleto = excepciones.find(e => !e.horaInicio && !e.horaFin);
        if (!diaCompleto)
            return { bloqueada: false };
        return { bloqueada: true, motivo: diaCompleto.motivo };
    }
    async obtenerBloqueosParciales(agenteId, clienteId, fecha) {
        const excepciones = await this.listarEnRango(clienteId, fecha, fecha, agenteId);
        return excepciones
            .filter(e => e.horaInicio && e.horaFin)
            .map(e => ({ horaInicio: e.horaInicio, horaFin: e.horaFin, motivo: e.motivo }));
    }
    async upsertDesdeGoogle(datos) {
        const existente = await this.excepcionRepository.findOne({
            where: { agenteId: datos.agenteId, clienteId: datos.clienteId, googleEventId: datos.googleEventId, estado: constants_1.Status.ACTIVE },
        });
        if (existente) {
            Object.assign(existente, {
                fechaInicio: datos.fecha,
                fechaFin: datos.fecha,
                horaInicio: datos.horaInicio,
                horaFin: datos.horaFin,
                motivo: datos.motivo,
                transaccion: constants_1.Transacccion.ACTUALIZAR,
                usuarioModificacion: datos.usuarioSistema,
            });
            await this.excepcionRepository.save(existente);
            return;
        }
        const nueva = this.excepcionRepository.create({
            agenteId: datos.agenteId,
            clienteId: datos.clienteId,
            fechaInicio: datos.fecha,
            fechaFin: datos.fecha,
            horaInicio: datos.horaInicio,
            horaFin: datos.horaFin,
            motivo: datos.motivo,
            tipo: 'google_calendar',
            googleEventId: datos.googleEventId,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion: datos.usuarioSistema,
        });
        await this.excepcionRepository.save(nueva);
    }
    async eliminarPorGoogleEventId(agenteId, clienteId, googleEventId, usuarioModificacion) {
        const existente = await this.excepcionRepository.findOne({
            where: { agenteId, clienteId, googleEventId, estado: constants_1.Status.ACTIVE },
        });
        if (!existente)
            return;
        existente.estado = constants_1.Status.ELIMINATE;
        existente.transaccion = constants_1.Transacccion.ELIMINAR;
        existente.usuarioModificacion = usuarioModificacion;
        await this.excepcionRepository.save(existente);
    }
    async crear(dto, usuarioCreacion, clienteId) {
        if (dto.fechaFin < dto.fechaInicio) {
            throw new common_1.BadRequestException('fechaFin debe ser igual o posterior a fechaInicio');
        }
        if (dto.agenteId)
            await this.validarAgenteHumano(dto.agenteId, clienteId);
        const excepcion = this.excepcionRepository.create({
            ...dto,
            agenteId: dto.agenteId || null,
            clienteId,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.excepcionRepository.save(excepcion);
    }
    async actualizar(id, dto, usuarioModificacion, clienteId) {
        const excepcion = await this.obtener(id, clienteId);
        const fechaInicio = dto.fechaInicio ?? excepcion.fechaInicio;
        const fechaFin = dto.fechaFin ?? excepcion.fechaFin;
        if (fechaFin < fechaInicio) {
            throw new common_1.BadRequestException('fechaFin debe ser igual o posterior a fechaInicio');
        }
        if (dto.agenteId)
            await this.validarAgenteHumano(dto.agenteId, clienteId);
        Object.assign(excepcion, dto, {
            agenteId: dto.agenteId !== undefined ? dto.agenteId || null : excepcion.agenteId,
            transaccion: constants_1.Transacccion.ACTUALIZAR,
            usuarioModificacion,
        });
        return this.excepcionRepository.save(excepcion);
    }
    async eliminar(id, usuarioModificacion, clienteId) {
        const excepcion = await this.obtener(id, clienteId);
        excepcion.estado = constants_1.Status.ELIMINATE;
        excepcion.transaccion = constants_1.Transacccion.ELIMINAR;
        excepcion.usuarioModificacion = usuarioModificacion;
        await this.excepcionRepository.save(excepcion);
    }
    async obtener(id, clienteId) {
        const excepcion = await this.excepcionRepository.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!excepcion)
            throw new common_1.NotFoundException('Excepción de calendario no encontrada');
        return excepcion;
    }
    async validarAgenteHumano(agenteId, clienteId) {
        const agente = await this.agenteService.obtener(agenteId, clienteId);
        if (agente.tipoAgente !== constants_1.TipoAgente.HUMANO) {
            throw new common_1.BadRequestException('Solo se pueden bloquear fechas de agentes humanos');
        }
    }
};
ExcepcionHorarioAgenteService = ExcepcionHorarioAgenteService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(excepcion_horario_agente_entity_1.ExcepcionHorarioAgente)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        agente_service_1.AgenteService])
], ExcepcionHorarioAgenteService);
exports.ExcepcionHorarioAgenteService = ExcepcionHorarioAgenteService;
//# sourceMappingURL=excepcion-horario-agente.service.js.map