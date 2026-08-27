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
var PromocionTiendaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromocionTiendaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const promocion_tienda_entity_1 = require("../entity/promocion-tienda.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
const fecha_bolivia_util_1 = require("../../../common/lib/fecha-bolivia.util");
let PromocionTiendaService = PromocionTiendaService_1 = class PromocionTiendaService extends base_service_1.BaseService {
    constructor(repo) {
        super(PromocionTiendaService_1.name);
        this.repo = repo;
    }
    async listar(clienteId) {
        return this.repo.find({ where: { clienteId, estado: constants_1.Status.ACTIVE }, order: { fechaInicio: 'DESC' } });
    }
    async obtener(id, clienteId) {
        const promo = await this.repo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!promo)
            throw new common_1.NotFoundException('Promoción no encontrada');
        return promo;
    }
    async obtenerVigente(articuloId, clienteId, sucursalId) {
        const ahora = new Date();
        const base = { articuloId, clienteId, activo: true, estado: constants_1.Status.ACTIVE, fechaInicio: (0, typeorm_2.LessThanOrEqual)(ahora), fechaFin: (0, typeorm_2.MoreThanOrEqual)(ahora) };
        const where = sucursalId ? [{ ...base, sucursalId }, { ...base, sucursalId: (0, typeorm_2.IsNull)() }] : [{ ...base, sucursalId: (0, typeorm_2.IsNull)() }];
        const candidatas = await this.repo.find({ where, order: { fechaInicio: 'DESC' } });
        return candidatas.find(p => p.sucursalId === sucursalId) || candidatas.find(p => !p.sucursalId) || null;
    }
    async obtenerVigentesPorCliente(clienteId, sucursalId) {
        const ahora = new Date();
        const base = { clienteId, activo: true, estado: constants_1.Status.ACTIVE, fechaInicio: (0, typeorm_2.LessThanOrEqual)(ahora), fechaFin: (0, typeorm_2.MoreThanOrEqual)(ahora) };
        const where = sucursalId ? [{ ...base, sucursalId }, { ...base, sucursalId: (0, typeorm_2.IsNull)() }] : [{ ...base, sucursalId: (0, typeorm_2.IsNull)() }];
        return this.repo.find({ where });
    }
    async crear(dto, clienteId, usuarioCreacion) {
        const fechaInicio = (0, fecha_bolivia_util_1.fechaHoraBoliviaAUtc)(dto.fechaInicio);
        const fechaFin = (0, fecha_bolivia_util_1.fechaHoraBoliviaAUtc)(dto.fechaFin);
        if (Number.isNaN(fechaInicio.getTime()) || Number.isNaN(fechaFin.getTime())) {
            throw new common_1.BadRequestException('fechaInicio/fechaFin inválidas');
        }
        if (fechaFin <= fechaInicio) {
            throw new common_1.BadRequestException('fechaFin debe ser posterior a fechaInicio');
        }
        const promo = this.repo.create({
            clienteId,
            articuloId: dto.articuloId,
            sucursalId: dto.sucursalId || null,
            precioPromocional: dto.precioPromocional,
            fechaInicio, fechaFin,
            activo: true,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.repo.save(promo);
    }
    async actualizar(id, dto, clienteId, usuarioModificacion) {
        const promo = await this.obtener(id, clienteId);
        const fechaInicio = dto.fechaInicio ? (0, fecha_bolivia_util_1.fechaHoraBoliviaAUtc)(dto.fechaInicio) : promo.fechaInicio;
        const fechaFin = dto.fechaFin ? (0, fecha_bolivia_util_1.fechaHoraBoliviaAUtc)(dto.fechaFin) : promo.fechaFin;
        if (fechaFin <= fechaInicio) {
            throw new common_1.BadRequestException('fechaFin debe ser posterior a fechaInicio');
        }
        Object.assign(promo, {
            sucursalId: dto.sucursalId !== undefined ? (dto.sucursalId || null) : promo.sucursalId,
            precioPromocional: dto.precioPromocional ?? promo.precioPromocional,
            fechaInicio, fechaFin,
            activo: dto.activo ?? promo.activo,
            transaccion: constants_1.Transacccion.ACTUALIZAR,
            usuarioModificacion,
        });
        return this.repo.save(promo);
    }
    async eliminar(id, clienteId, usuarioModificacion) {
        const promo = await this.obtener(id, clienteId);
        promo.estado = constants_1.Status.ELIMINATE;
        promo.transaccion = constants_1.Transacccion.ELIMINAR;
        promo.usuarioModificacion = usuarioModificacion;
        await this.repo.save(promo);
    }
};
PromocionTiendaService = PromocionTiendaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(promocion_tienda_entity_1.PromocionTienda)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PromocionTiendaService);
exports.PromocionTiendaService = PromocionTiendaService;
//# sourceMappingURL=promocion-tienda.service.js.map