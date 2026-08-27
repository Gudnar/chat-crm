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
var InventarioSucursalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventarioSucursalService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inventario_sucursal_entity_1 = require("../entity/inventario-sucursal.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
let InventarioSucursalService = InventarioSucursalService_1 = class InventarioSucursalService extends base_service_1.BaseService {
    constructor(repo) {
        super(InventarioSucursalService_1.name);
        this.repo = repo;
    }
    async listarPorSucursal(sucursalId) {
        return this.repo.find({
            where: { sucursalId, estado: constants_1.Status.ACTIVE, activo: true },
            order: { id: 'ASC' },
        });
    }
    async obtenerPorProducto(productoId, sucursalId) {
        const inv = await this.repo.findOne({
            where: { productoId, sucursalId, estado: constants_1.Status.ACTIVE },
        });
        if (!inv)
            throw new common_1.NotFoundException('Inventario no encontrado');
        return inv;
    }
    async crear(sucursalId, dto, usuarioCreacion) {
        const existente = await this.repo.findOne({
            where: { sucursalId, productoId: dto.productoId },
        });
        if (existente && existente.estado === constants_1.Status.ACTIVE) {
            throw new common_1.BadRequestException('Este producto ya existe en el inventario de la sucursal');
        }
        const inventario = new inventario_sucursal_entity_1.InventarioSucursal({
            sucursalId,
            productoId: dto.productoId,
            stock: dto.stock !== undefined ? dto.stock : undefined,
            stockMinimo: dto.stockMinimo || 5,
            activo: true,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.repo.save(inventario);
    }
    async actualizar(id, sucursalId, dto, usuarioModificacion) {
        const inv = await this.repo.findOne({
            where: { id, sucursalId, estado: constants_1.Status.ACTIVE },
        });
        if (!inv)
            throw new common_1.NotFoundException('Inventario no encontrado');
        Object.assign(inv, dto, { transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.repo.save(inv);
    }
    async eliminar(id, sucursalId, usuarioModificacion) {
        const inv = await this.repo.findOne({
            where: { id, sucursalId, estado: constants_1.Status.ACTIVE },
        });
        if (!inv)
            throw new common_1.NotFoundException('Inventario no encontrado');
        inv.estado = constants_1.Status.ELIMINATE;
        inv.transaccion = constants_1.Transacccion.ELIMINAR;
        inv.usuarioModificacion = usuarioModificacion;
        await this.repo.save(inv);
    }
    async ajustarStock(productoId, sucursalId, dto, usuarioModificacion) {
        const inv = await this.obtenerPorProducto(productoId, sucursalId);
        if (inv.stock === null || inv.stock === undefined) {
            return inv;
        }
        if (inv.stock < dto.cantidad) {
            throw new common_1.BadRequestException(`Stock insuficiente. Disponible: ${inv.stock}, solicitado: ${dto.cantidad}`);
        }
        inv.stock = inv.stock - dto.cantidad;
        inv.transaccion = constants_1.Transacccion.ACTUALIZAR;
        inv.usuarioModificacion = usuarioModificacion;
        return this.repo.save(inv);
    }
    async listarStockBajo(sucursalId) {
        return this.repo.query(`SELECT * FROM inventario_sucursal
       WHERE sucursal_id = $1
       AND estado = $2
       AND activo = true
       AND stock IS NOT NULL
       AND stock <= stock_minimo
       ORDER BY stock ASC`, [sucursalId, constants_1.Status.ACTIVE]);
    }
};
InventarioSucursalService = InventarioSucursalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(inventario_sucursal_entity_1.InventarioSucursal)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], InventarioSucursalService);
exports.InventarioSucursalService = InventarioSucursalService;
//# sourceMappingURL=inventario-sucursal.service.js.map