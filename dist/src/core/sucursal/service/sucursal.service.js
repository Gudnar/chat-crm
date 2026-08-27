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
var SucursalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SucursalService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sucursal_entity_1 = require("../entity/sucursal.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
let SucursalService = SucursalService_1 = class SucursalService extends base_service_1.BaseService {
    constructor(repo) {
        super(SucursalService_1.name);
        this.repo = repo;
    }
    async listar(clienteId, soloActivas = false) {
        const where = { clienteId, estado: constants_1.Status.ACTIVE };
        if (soloActivas)
            where.activo = true;
        return this.repo.find({ where, order: { nombre: 'ASC' } });
    }
    async obtener(id, clienteId) {
        const s = await this.repo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!s)
            throw new common_1.NotFoundException('Sucursal no encontrada');
        return s;
    }
    async crear(dto, clienteId, usuarioCreacion) {
        const existente = await this.repo.findOne({
            where: { clienteId, codigo: dto.codigo, estado: constants_1.Status.ACTIVE },
        });
        if (existente) {
            throw new common_1.BadRequestException(`El código "${dto.codigo}" ya existe en este cliente`);
        }
        const sucursal = this.repo.create({
            ...dto,
            clienteId,
            activo: true,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.repo.save(sucursal);
    }
    async actualizar(id, dto, clienteId, usuarioModificacion) {
        const s = await this.obtener(id, clienteId);
        if (dto.codigo && dto.codigo !== s.codigo) {
            const existente = await this.repo.findOne({
                where: { clienteId, codigo: dto.codigo, estado: constants_1.Status.ACTIVE },
            });
            if (existente) {
                throw new common_1.BadRequestException(`El código "${dto.codigo}" ya existe en este cliente`);
            }
        }
        Object.assign(s, dto, { transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.repo.save(s);
    }
    async eliminar(id, clienteId, usuarioModificacion) {
        const s = await this.obtener(id, clienteId);
        s.estado = constants_1.Status.ELIMINATE;
        s.transaccion = constants_1.Transacccion.ELIMINAR;
        s.usuarioModificacion = usuarioModificacion;
        await this.repo.save(s);
    }
    async resumen(id, clienteId) {
        const sucursal = await this.obtener(id, clienteId);
        return {
            sucursal,
            pedidosHoy: 0,
            stockBajo: 0,
            cajaAbierta: false,
        };
    }
    async setImagenQr(id, url, clienteId, usuarioModificacion) {
        const s = await this.obtener(id, clienteId);
        s.qrImagenUrl = url;
        s.transaccion = constants_1.Transacccion.ACTUALIZAR;
        s.usuarioModificacion = usuarioModificacion;
        return this.repo.save(s);
    }
};
SucursalService = SucursalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sucursal_entity_1.Sucursal)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SucursalService);
exports.SucursalService = SucursalService;
//# sourceMappingURL=sucursal.service.js.map