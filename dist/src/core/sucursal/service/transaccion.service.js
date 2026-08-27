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
var TransaccionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransaccionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaccion_entity_1 = require("../entity/transaccion.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
let TransaccionService = TransaccionService_1 = class TransaccionService extends base_service_1.BaseService {
    constructor(repo) {
        super(TransaccionService_1.name);
        this.repo = repo;
    }
    async listarPorSucursal(sucursalId, desde, hasta) {
        let qb = this.repo.createQueryBuilder('t')
            .where('t.sucursalId = :sucursalId', { sucursalId })
            .andWhere('t.estado = :estado', { estado: constants_1.Status.ACTIVE });
        if (desde)
            qb = qb.andWhere('t.fecha >= :desde', { desde });
        if (hasta)
            qb = qb.andWhere('t.fecha <= :hasta', { hasta });
        return qb.orderBy('t.fecha', 'DESC').getMany();
    }
    async listarPorCaja(cajaSucursalId) {
        const qb = this.repo.createQueryBuilder('t')
            .where('t.cajaSucursalId = :cajaSucursalId', { cajaSucursalId })
            .andWhere('t.estado = :est', { est: constants_1.Status.ACTIVE })
            .orderBy('t.fecha', 'DESC');
        return qb.getMany();
    }
    async crear(clienteId, sucursalId, dto, usuarioCreacion) {
        const fecha = dto.fecha || new Date();
        const transaccion = new transaccion_entity_1.Transaccion({
            clienteId,
            sucursalId,
            tipo: dto.tipo,
            metodoPago: dto.metodoPago,
            monto: dto.monto,
            pedidoId: dto.pedidoId,
            cajaSucursalId: dto.cajaSucursalId,
            referencia: dto.referencia,
            descripcion: dto.descripcion,
            fecha,
            estadoTransaccion: 'confirmado',
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.repo.save(transaccion);
    }
    async calcularTotalPorCaja(cajaSucursalId) {
        const result = await this.repo
            .createQueryBuilder('t')
            .select('SUM(t.monto)', 'total')
            .where('t.cajaSucursalId = :cajaSucursalId', { cajaSucursalId })
            .andWhere('t.estado = :estado', { estado: constants_1.Status.ACTIVE })
            .andWhere('t.tipo IN (:...tipos)', { tipos: ['venta', 'ingreso_manual'] })
            .getRawOne();
        return result?.total ? Number(result.total) : 0;
    }
    async calcularEgresosPorCaja(cajaSucursalId) {
        const result = await this.repo
            .createQueryBuilder('t')
            .select('SUM(t.monto)', 'total')
            .where('t.cajaSucursalId = :cajaSucursalId', { cajaSucursalId })
            .andWhere('t.estado = :estado', { estado: constants_1.Status.ACTIVE })
            .andWhere('t.tipo IN (:...tipos)', { tipos: ['gasto', 'reembolso'] })
            .getRawOne();
        return result?.total ? Number(result.total) : 0;
    }
};
TransaccionService = TransaccionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaccion_entity_1.Transaccion)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TransaccionService);
exports.TransaccionService = TransaccionService;
//# sourceMappingURL=transaccion.service.js.map