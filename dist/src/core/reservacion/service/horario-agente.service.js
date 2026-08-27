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
var HorarioAgenteService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HorarioAgenteService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const horario_agente_entity_1 = require("../entity/horario-agente.entity");
const excepcion_horario_agente_service_1 = require("./excepcion-horario-agente.service");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
let HorarioAgenteService = HorarioAgenteService_1 = class HorarioAgenteService extends base_service_1.BaseService {
    constructor(horarioAgenteRepository, excepcionHorarioAgenteService) {
        super(HorarioAgenteService_1.name);
        this.horarioAgenteRepository = horarioAgenteRepository;
        this.excepcionHorarioAgenteService = excepcionHorarioAgenteService;
    }
    async listarPorAgente(agenteId, clienteId) {
        return this.horarioAgenteRepository.find({
            where: { agenteId, clienteId, estado: constants_1.Status.ACTIVE },
            order: { diaSemana: 'ASC', horaInicio: 'ASC' },
        });
    }
    async crear(dto, usuarioCreacion, clienteId) {
        if (dto.horaFin <= dto.horaInicio) {
            throw new common_1.NotFoundException('horaFin debe ser posterior a horaInicio');
        }
        const horario = this.horarioAgenteRepository.create({
            ...dto,
            clienteId,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.horarioAgenteRepository.save(horario);
    }
    async eliminar(id, usuarioModificacion, clienteId) {
        const horario = await this.horarioAgenteRepository.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!horario)
            throw new common_1.NotFoundException('Horario no encontrado');
        horario.estado = constants_1.Status.ELIMINATE;
        horario.transaccion = constants_1.Transacccion.ELIMINAR;
        horario.usuarioModificacion = usuarioModificacion;
        await this.horarioAgenteRepository.save(horario);
    }
    async generarSlotsBase(agenteId, clienteId, fecha, duracionMinutos) {
        const { bloqueada } = await this.excepcionHorarioAgenteService.estaBloqueada(agenteId, clienteId, fecha);
        if (bloqueada)
            return [];
        const bloqueosParciales = await this.excepcionHorarioAgenteService.obtenerBloqueosParciales(agenteId, clienteId, fecha);
        const diaSemana = new Date(`${fecha}T00:00:00`).getDay();
        const horarios = await this.horarioAgenteRepository.find({
            where: { agenteId, clienteId, diaSemana, activo: true, estado: constants_1.Status.ACTIVE },
            order: { horaInicio: 'ASC' },
        });
        const slots = [];
        for (const horario of horarios) {
            const inicioMin = this.aMinutos(horario.horaInicio);
            const finMin = this.aMinutos(horario.horaFin);
            for (let m = inicioMin; m + duracionMinutos <= finMin; m += duracionMinutos) {
                const slotFin = m + duracionMinutos;
                const chocaConBloqueo = bloqueosParciales.some(b => {
                    const bIni = this.aMinutos(b.horaInicio);
                    const bFin = this.aMinutos(b.horaFin);
                    return m < bFin && slotFin > bIni;
                });
                if (!chocaConBloqueo)
                    slots.push(this.aHHmm(m));
            }
        }
        return slots;
    }
    aMinutos(hhmm) {
        const [h, m] = hhmm.split(':').map(Number);
        return h * 60 + m;
    }
    aHHmm(minutos) {
        const h = Math.floor(minutos / 60);
        const m = minutos % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
};
HorarioAgenteService = HorarioAgenteService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(horario_agente_entity_1.HorarioAgente)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        excepcion_horario_agente_service_1.ExcepcionHorarioAgenteService])
], HorarioAgenteService);
exports.HorarioAgenteService = HorarioAgenteService;
//# sourceMappingURL=horario-agente.service.js.map