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
var ServicioAgenteService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicioAgenteService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const servicio_agente_entity_1 = require("../entity/servicio-agente.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
let ServicioAgenteService = ServicioAgenteService_1 = class ServicioAgenteService extends base_service_1.BaseService {
    constructor(servicioAgenteRepository) {
        super(ServicioAgenteService_1.name);
        this.servicioAgenteRepository = servicioAgenteRepository;
    }
    async listarPorAgente(agenteId, clienteId) {
        return this.servicioAgenteRepository.find({
            where: { agenteId, clienteId, estado: constants_1.Status.ACTIVE },
            order: { fechaCreacion: 'ASC' },
        });
    }
    async obtener(id, clienteId) {
        const servicio = await this.servicioAgenteRepository.findOne({
            where: { id, clienteId, estado: constants_1.Status.ACTIVE },
        });
        if (!servicio)
            throw new common_1.NotFoundException('Servicio no encontrado');
        return servicio;
    }
    async crear(dto, usuarioCreacion, clienteId) {
        const servicio = this.servicioAgenteRepository.create({
            ...dto,
            clienteId,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.servicioAgenteRepository.save(servicio);
    }
    async actualizar(id, dto, usuarioModificacion, clienteId) {
        const servicio = await this.obtener(id, clienteId);
        Object.assign(servicio, { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.servicioAgenteRepository.save(servicio);
    }
    async eliminar(id, usuarioModificacion, clienteId) {
        const servicio = await this.obtener(id, clienteId);
        servicio.estado = constants_1.Status.ELIMINATE;
        servicio.transaccion = constants_1.Transacccion.ELIMINAR;
        servicio.usuarioModificacion = usuarioModificacion;
        await this.servicioAgenteRepository.save(servicio);
    }
};
ServicioAgenteService = ServicioAgenteService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(servicio_agente_entity_1.ServicioAgente)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ServicioAgenteService);
exports.ServicioAgenteService = ServicioAgenteService;
//# sourceMappingURL=servicio-agente.service.js.map