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
var ReservacionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservacionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reserva_entity_1 = require("../entity/reserva.entity");
const servicio_agente_service_1 = require("./servicio-agente.service");
const horario_agente_service_1 = require("./horario-agente.service");
const agente_service_1 = require("../../agente/service/agente.service");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
let ReservacionService = ReservacionService_1 = class ReservacionService extends base_service_1.BaseService {
    constructor(reservaRepository, servicioAgenteService, horarioAgenteService, agenteService) {
        super(ReservacionService_1.name);
        this.reservaRepository = reservaRepository;
        this.servicioAgenteService = servicioAgenteService;
        this.horarioAgenteService = horarioAgenteService;
        this.agenteService = agenteService;
    }
    async listar(clienteId, filtros) {
        const where = { clienteId, estado: constants_1.Status.ACTIVE };
        if (filtros?.agenteId)
            where.agenteId = filtros.agenteId;
        if (filtros?.estado)
            where.estadoReserva = filtros.estado;
        const reservas = await this.reservaRepository.find({ where, order: { fechaInicio: 'ASC' } });
        const desde = filtros?.desde ? new Date(filtros.desde) : null;
        const hasta = filtros?.hasta ? new Date(filtros.hasta) : null;
        return reservas.filter(r => (!desde || r.fechaInicio >= desde) && (!hasta || r.fechaInicio <= hasta));
    }
    async obtener(id, clienteId) {
        const reserva = await this.reservaRepository.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!reserva)
            throw new common_1.NotFoundException('Reserva no encontrada');
        return reserva;
    }
    async crear(dto, usuarioCreacion, clienteId) {
        const agente = await this.agenteService.obtener(dto.agenteId, clienteId);
        if (!agente.activo)
            throw new common_1.BadRequestException('El agente no está activo');
        let duracionMinutos = dto.duracionMinutos;
        if (!duracionMinutos && dto.servicioAgenteId) {
            const servicio = await this.servicioAgenteService.obtener(dto.servicioAgenteId, clienteId);
            duracionMinutos = servicio.duracionMinutos;
        }
        duracionMinutos = duracionMinutos || 30;
        const fechaInicio = new Date(dto.fechaInicio);
        if (Number.isNaN(fechaInicio.getTime()))
            throw new common_1.BadRequestException('fechaInicio inválida');
        const fechaFin = new Date(fechaInicio.getTime() + duracionMinutos * 60000);
        if (agente.tipoAgente === constants_1.TipoAgente.HUMANO) {
            await this.validarDentroDeHorario(dto.agenteId, clienteId, fechaInicio, fechaFin);
            await this.validarSinSolapamiento(dto.agenteId, clienteId, fechaInicio, fechaFin);
        }
        const reserva = this.reservaRepository.create({
            agenteId: dto.agenteId,
            tipoAgenteReserva: agente.tipoAgente,
            servicioAgenteId: dto.servicioAgenteId,
            conversacionId: dto.conversacionId,
            contactoNombre: dto.contactoNombre,
            contactoTelefono: dto.contactoTelefono,
            contactoEmail: dto.contactoEmail,
            fechaInicio,
            fechaFin,
            duracionMinutos,
            titulo: dto.titulo,
            descripcion: dto.descripcion,
            tipoServicio: dto.tipoServicio,
            estadoReserva: constants_1.EstadoReserva.CONFIRMADA,
            clienteId,
            codigoReserva: await this.generarCodigoReserva(clienteId),
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.reservaRepository.save(reserva);
    }
    async actualizar(id, dto, usuarioModificacion, clienteId) {
        const reserva = await this.obtener(id, clienteId);
        let fechaInicio = reserva.fechaInicio;
        let duracionMinutos = dto.duracionMinutos ?? reserva.duracionMinutos;
        if (dto.fechaInicio) {
            fechaInicio = new Date(dto.fechaInicio);
            if (Number.isNaN(fechaInicio.getTime()))
                throw new common_1.BadRequestException('fechaInicio inválida');
        }
        const fechaFin = new Date(fechaInicio.getTime() + duracionMinutos * 60000);
        if (dto.fechaInicio || dto.duracionMinutos) {
            if (reserva.tipoAgenteReserva === constants_1.TipoAgente.HUMANO) {
                await this.validarDentroDeHorario(reserva.agenteId, clienteId, fechaInicio, fechaFin);
                await this.validarSinSolapamiento(reserva.agenteId, clienteId, fechaInicio, fechaFin, reserva.id);
            }
        }
        Object.assign(reserva, {
            fechaInicio,
            fechaFin,
            duracionMinutos,
            titulo: dto.titulo ?? reserva.titulo,
            descripcion: dto.descripcion ?? reserva.descripcion,
            notasInternas: dto.notasInternas ?? reserva.notasInternas,
            transaccion: constants_1.Transacccion.ACTUALIZAR,
            usuarioModificacion,
        });
        return this.reservaRepository.save(reserva);
    }
    async actualizarEstado(id, dto, usuarioModificacion, clienteId) {
        const reserva = await this.obtener(id, clienteId);
        Object.assign(reserva, {
            estadoReserva: dto.estado,
            resultado: dto.resultado ?? reserva.resultado,
            notasInternas: dto.notasInternas ?? reserva.notasInternas,
            transaccion: constants_1.Transacccion.ACTUALIZAR,
            usuarioModificacion,
        });
        return this.reservaRepository.save(reserva);
    }
    async obtenerDisponibilidad(agenteId, clienteId, fecha, duracionMinutos) {
        const agente = await this.agenteService.obtener(agenteId, clienteId);
        const slots = await this.horarioAgenteService.generarSlotsBase(agenteId, clienteId, fecha, duracionMinutos);
        if (agente.tipoAgente !== constants_1.TipoAgente.HUMANO)
            return slots;
        const inicioDia = new Date(`${fecha}T00:00:00`);
        const finDia = new Date(`${fecha}T23:59:59`);
        const reservasAgente = await this.reservaRepository.find({
            where: { agenteId, clienteId, estado: constants_1.Status.ACTIVE, estadoReserva: (0, typeorm_2.Not)(constants_1.EstadoReserva.CANCELADA) },
        });
        const delDia = reservasAgente.filter(r => r.fechaInicio >= inicioDia && r.fechaInicio <= finDia);
        return slots.filter(hhmm => {
            const inicio = this.aFechaLocal(fecha, hhmm);
            const fin = new Date(inicio.getTime() + duracionMinutos * 60000);
            return !delDia.some(r => this.seSolapan(inicio, fin, r.fechaInicio, r.fechaFin));
        });
    }
    aFechaLocal(fecha, horaHHmm) {
        const [anio, mes, dia] = fecha.split('-').map(Number);
        const [h, m] = horaHHmm.split(':').map(Number);
        return new Date(anio, mes - 1, dia, h, m, 0, 0);
    }
    aFechaYHoraLocal(fecha) {
        const pad = (n) => String(n).padStart(2, '0');
        return {
            fecha: `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`,
            hora: `${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`,
        };
    }
    async validarDentroDeHorario(agenteId, clienteId, fechaInicio, fechaFin) {
        const { fecha, hora: horaInicioStr } = this.aFechaYHoraLocal(fechaInicio);
        const duracion = Math.round((fechaFin.getTime() - fechaInicio.getTime()) / 60000);
        const slots = await this.horarioAgenteService.generarSlotsBase(agenteId, clienteId, fecha, duracion);
        if (!slots.includes(horaInicioStr)) {
            throw new common_1.BadRequestException(`El agente no tiene horario de atención disponible el ${fecha} a las ${horaInicioStr} por ${duracion} minutos.`);
        }
    }
    async validarSinSolapamiento(agenteId, clienteId, fechaInicio, fechaFin, excluirReservaId) {
        const candidatas = await this.reservaRepository.find({
            where: { agenteId, clienteId, estado: constants_1.Status.ACTIVE, estadoReserva: (0, typeorm_2.Not)(constants_1.EstadoReserva.CANCELADA) },
        });
        const solapa = candidatas.some(r => {
            if (excluirReservaId && r.id === excluirReservaId)
                return false;
            return this.seSolapan(fechaInicio, fechaFin, r.fechaInicio, r.fechaFin);
        });
        if (solapa) {
            throw new common_1.ConflictException('El agente ya tiene una reserva confirmada que se solapa con ese horario.');
        }
    }
    seSolapan(inicio1, fin1, inicio2, fin2) {
        return inicio1 < fin2 && inicio2 < fin1;
    }
    async generarCodigoReserva(clienteId) {
        const yyyymmdd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const prefijo = `RES-${yyyymmdd}-`;
        const conteo = await this.reservaRepository
            .createQueryBuilder('r')
            .where('r.cliente_id = :clienteId', { clienteId })
            .andWhere('r.codigo_reserva LIKE :prefijo', { prefijo: `${prefijo}%` })
            .getCount();
        const consecutivo = String(conteo + 1).padStart(4, '0');
        return `${prefijo}${consecutivo}`;
    }
};
ReservacionService = ReservacionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reserva_entity_1.Reserva)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        servicio_agente_service_1.ServicioAgenteService,
        horario_agente_service_1.HorarioAgenteService,
        agente_service_1.AgenteService])
], ReservacionService);
exports.ReservacionService = ReservacionService;
//# sourceMappingURL=reservacion.service.js.map