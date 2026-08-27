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
var PedidoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PedidoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pedido_entity_1 = require("../entity/pedido.entity");
const sucursal_entity_1 = require("../entity/sucursal.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
let PedidoService = PedidoService_1 = class PedidoService extends base_service_1.BaseService {
    constructor(repo, sucursalRepo) {
        super(PedidoService_1.name);
        this.repo = repo;
        this.sucursalRepo = sucursalRepo;
    }
    async listarPorSucursal(sucursalId, estadoPedido) {
        const qb = this.repo.createQueryBuilder('p')
            .where('p.sucursalId = :sucursalId', { sucursalId })
            .andWhere('p.estado = :est', { est: constants_1.Status.ACTIVE });
        if (estadoPedido)
            qb.andWhere('p.estadoPedido = :estadoPedido', { estadoPedido });
        return qb.orderBy('p.fechaConfirmacion', 'DESC').addOrderBy('p._fecha_creacion', 'DESC').getMany();
    }
    async obtener(id, clienteId) {
        const p = await this.repo.findOne({
            where: { id, clienteId, estado: constants_1.Status.ACTIVE },
        });
        if (!p)
            throw new common_1.NotFoundException('Pedido no encontrado');
        return p;
    }
    async obtenerPorCodigo(codigoPedido, clienteId) {
        const p = await this.repo.findOne({
            where: { codigoPedido, clienteId, estado: constants_1.Status.ACTIVE },
        });
        if (!p)
            throw new common_1.NotFoundException('Pedido no encontrado');
        return p;
    }
    async obtenerPorConversacion(conversacionId, clienteId) {
        return this.repo.findOne({
            where: { conversacionId, clienteId, estado: constants_1.Status.ACTIVE },
        });
    }
    async crear(clienteId, dto, usuarioCreacion) {
        const sucursal = await this.sucursalRepo.findOne({
            where: { id: dto.sucursalId, clienteId, estado: constants_1.Status.ACTIVE },
        });
        if (!sucursal)
            throw new common_1.NotFoundException('Sucursal no encontrada');
        const lastPedido = await this.repo
            .createQueryBuilder('p')
            .where('p.sucursalId = :sucursalId', { sucursalId: dto.sucursalId })
            .andWhere('p.clienteId = :clienteId', { clienteId })
            .orderBy('p._fecha_creacion', 'DESC')
            .getOne();
        let numeroConsecutivo = 1;
        if (lastPedido && lastPedido.codigoPedido) {
            const match = lastPedido.codigoPedido.match(/-(\d+)$/);
            if (match) {
                numeroConsecutivo = parseInt(match[1], 10) + 1;
            }
        }
        const codigoPedido = `${sucursal.codigo}-${String(numeroConsecutivo).padStart(5, '0')}`;
        const pedido = this.repo.create({
            clienteId,
            ...dto,
            codigoPedido,
            estadoPedido: 'pendiente_confirmacion',
            estadoPago: 'pendiente',
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.repo.save(pedido);
    }
    async cambiarEstado(id, clienteId, dto, usuarioModificacion) {
        const p = await this.obtener(id, clienteId);
        const transicionesValidas = {
            pendiente_confirmacion: ['confirmado', 'cancelado'],
            confirmado: ['en_preparacion', 'cancelado'],
            en_preparacion: ['listo', 'cancelado'],
            listo: ['en_camino', 'cancelado'],
            en_camino: ['entregado', 'cancelado'],
            entregado: [],
            cancelado: [],
        };
        const estPrevio = p.estadoPedido;
        if (!transicionesValidas[estPrevio]?.includes(dto.estadoPedido)) {
            throw new common_1.BadRequestException(`No se puede cambiar de "${estPrevio}" a "${dto.estadoPedido}"`);
        }
        p.estadoPedido = dto.estadoPedido;
        if (dto.estadoPedido === 'cancelado') {
            p.motivoCancelacion = dto.motivoCancelacion;
        }
        if (dto.estadoPedido === 'confirmado') {
            p.fechaConfirmacion = new Date();
        }
        else if (dto.estadoPedido === 'listo') {
            p.fechaListo = new Date();
        }
        else if (dto.estadoPedido === 'entregado') {
            p.fechaEntrega = new Date();
        }
        p.transaccion = constants_1.Transacccion.ACTUALIZAR;
        p.usuarioModificacion = usuarioModificacion;
        return this.repo.save(p);
    }
    async cambiarEstadoPago(id, clienteId, dto, usuarioModificacion) {
        const p = await this.obtener(id, clienteId);
        p.estadoPago = dto.estadoPago;
        p.transaccion = constants_1.Transacccion.ACTUALIZAR;
        p.usuarioModificacion = usuarioModificacion;
        return this.repo.save(p);
    }
    async eliminar(id, clienteId, usuarioModificacion) {
        const p = await this.obtener(id, clienteId);
        p.estado = constants_1.Status.ELIMINATE;
        p.transaccion = constants_1.Transacccion.ELIMINAR;
        p.usuarioModificacion = usuarioModificacion;
        await this.repo.save(p);
    }
};
PedidoService = PedidoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pedido_entity_1.Pedido)),
    __param(1, (0, typeorm_1.InjectRepository)(sucursal_entity_1.Sucursal)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PedidoService);
exports.PedidoService = PedidoService;
//# sourceMappingURL=pedido.service.js.map