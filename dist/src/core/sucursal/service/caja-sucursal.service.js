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
var CajaSucursalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CajaSucursalService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const caja_sucursal_entity_1 = require("../entity/caja-sucursal.entity");
const transaccion_service_1 = require("./transaccion.service");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
let CajaSucursalService = CajaSucursalService_1 = class CajaSucursalService extends base_service_1.BaseService {
    constructor(repo, transaccionService) {
        super(CajaSucursalService_1.name);
        this.repo = repo;
        this.transaccionService = transaccionService;
    }
    async obtenerCajaAbierta(sucursalId) {
        const qb = this.repo.createQueryBuilder('c')
            .where('c.sucursalId = :sucursalId', { sucursalId })
            .andWhere('c.estadoCaja = :estadoCaja', { estadoCaja: 'abierta' })
            .andWhere('c.estado = :est', { est: constants_1.Status.ACTIVE })
            .orderBy('c.fechaApertura', 'DESC');
        return qb.getOne();
    }
    async abrirCaja(clienteId, sucursalId, usuarioId, dto, usuarioCreacion) {
        const cajaAbierta = await this.obtenerCajaAbierta(sucursalId);
        if (cajaAbierta) {
            throw new common_1.BadRequestException('Ya existe una caja abierta en esta sucursal');
        }
        const caja = new caja_sucursal_entity_1.CajaSucursal({
            clienteId,
            sucursalId,
            usuarioId,
            montoApertura: dto.montoApertura,
            notas: dto.notas,
            estadoCaja: 'abierta',
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.repo.save(caja);
    }
    async cerrarCaja(cajaId, sucursalId, clienteId, dto, usuarioModificacion) {
        const caja = await this.repo.findOne({
            where: { id: cajaId, sucursalId, clienteId, estadoCaja: 'abierta', estado: constants_1.Status.ACTIVE },
        });
        if (!caja)
            throw new common_1.NotFoundException('Caja no encontrada o ya cerrada');
        const ingresos = await this.transaccionService.calcularTotalPorCaja(cajaId);
        const egresos = await this.transaccionService.calcularEgresosPorCaja(cajaId);
        const montoCierreCalculado = caja.montoApertura + ingresos - egresos;
        caja.montoCierreDeclarado = dto.montoCierreDeclarado;
        caja.montoCierreCalculado = montoCierreCalculado;
        caja.diferencia = dto.montoCierreDeclarado - montoCierreCalculado;
        caja.fechaCierre = new Date();
        caja.estadoCaja = 'cerrada';
        caja.transaccion = constants_1.Transacccion.ACTUALIZAR;
        caja.usuarioModificacion = usuarioModificacion;
        return this.repo.save(caja);
    }
    async listarCajasPorSucursal(sucursalId, estadoCaja) {
        const qb = this.repo.createQueryBuilder('c')
            .where('c.sucursalId = :sucursalId', { sucursalId })
            .andWhere('c.estado = :est', { est: constants_1.Status.ACTIVE });
        if (estadoCaja)
            qb.andWhere('c.estadoCaja = :estadoCaja', { estadoCaja });
        return qb.orderBy('c.fechaApertura', 'DESC').getMany();
    }
};
CajaSucursalService = CajaSucursalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(caja_sucursal_entity_1.CajaSucursal)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        transaccion_service_1.TransaccionService])
], CajaSucursalService);
exports.CajaSucursalService = CajaSucursalService;
//# sourceMappingURL=caja-sucursal.service.js.map