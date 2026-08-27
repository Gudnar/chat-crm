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
var ClienteFinalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClienteFinalService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cliente_final_entity_1 = require("../entity/cliente-final.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
let ClienteFinalService = ClienteFinalService_1 = class ClienteFinalService extends base_service_1.BaseService {
    constructor(repo) {
        super(ClienteFinalService_1.name);
        this.repo = repo;
    }
    async listarPorCliente(clienteId, sucursalId) {
        const where = { clienteId, estado: constants_1.Status.ACTIVE };
        if (sucursalId)
            where.sucursalId = sucursalId;
        return this.repo.find({
            where,
            order: { nombre: 'ASC' },
        });
    }
    async obtener(id, clienteId) {
        const c = await this.repo.findOne({
            where: { id, clienteId, estado: constants_1.Status.ACTIVE },
        });
        if (!c)
            throw new common_1.NotFoundException('Cliente final no encontrado');
        return c;
    }
    async buscarPorTelefono(clienteId, telefono) {
        return this.repo.findOne({
            where: { clienteId, telefono, estado: constants_1.Status.ACTIVE },
        });
    }
    async crear(clienteId, dto, usuarioCreacion) {
        const cliente = this.repo.create({
            clienteId,
            ...dto,
            direcciones: dto.direcciones || [],
            totalPedidos: 0,
            totalGastado: 0,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.repo.save(cliente);
    }
    async actualizar(id, clienteId, dto, usuarioModificacion) {
        const c = await this.obtener(id, clienteId);
        Object.assign(c, dto, { transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.repo.save(c);
    }
    async eliminar(id, clienteId, usuarioModificacion) {
        const c = await this.obtener(id, clienteId);
        c.estado = constants_1.Status.ELIMINATE;
        c.transaccion = constants_1.Transacccion.ELIMINAR;
        c.usuarioModificacion = usuarioModificacion;
        await this.repo.save(c);
    }
    async registrarCompra(id, clienteId, monto, usuarioModificacion) {
        const c = await this.obtener(id, clienteId);
        c.totalPedidos += 1;
        c.totalGastado = Number(c.totalGastado) + monto;
        c.ultimaCompra = new Date();
        c.transaccion = constants_1.Transacccion.ACTUALIZAR;
        c.usuarioModificacion = usuarioModificacion;
        return this.repo.save(c);
    }
};
ClienteFinalService = ClienteFinalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cliente_final_entity_1.ClienteFinal)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ClienteFinalService);
exports.ClienteFinalService = ClienteFinalService;
//# sourceMappingURL=cliente-final.service.js.map