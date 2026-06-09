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
var ConfiguracionClienteService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracionClienteService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const configuracion_cliente_entity_1 = require("../entity/configuracion-cliente.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
let ConfiguracionClienteService = ConfiguracionClienteService_1 = class ConfiguracionClienteService extends base_service_1.BaseService {
    constructor(repo) {
        super(ConfiguracionClienteService_1.name);
        this.repo = repo;
    }
    async listar(clienteId) {
        const configs = await this.repo.find({ where: { clienteId, estado: constants_1.Status.ACTIVE } });
        return configs.map(c => ({
            ...c,
            valor: c.esSecreto && c.valor ? '••••••••••••••••' : c.valor,
        }));
    }
    async obtenerPorClave(clienteId, clave) {
        return this.repo.findOne({ where: { clienteId, clave, estado: constants_1.Status.ACTIVE } });
    }
    async set(clienteId, dto, usuarioCreacion) {
        const existe = await this.obtenerPorClave(clienteId, dto.clave);
        if (existe) {
            Object.assign(existe, {
                valor: dto.valor,
                descripcion: dto.descripcion ?? existe.descripcion,
                esSecreto: dto.esSecreto ?? existe.esSecreto,
                transaccion: constants_1.Transacccion.ACTUALIZAR,
                usuarioModificacion: usuarioCreacion,
            });
            return this.repo.save(existe);
        }
        const nueva = this.repo.create({
            ...dto,
            clienteId,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.repo.save(nueva);
    }
    async eliminar(clienteId, clave, usuarioModificacion) {
        const config = await this.obtenerPorClave(clienteId, clave);
        if (!config)
            return;
        config.estado = constants_1.Status.ELIMINATE;
        config.transaccion = constants_1.Transacccion.ELIMINAR;
        config.usuarioModificacion = usuarioModificacion;
        await this.repo.save(config);
    }
    async resolverClientePorPhoneNumberId(phoneNumberId) {
        const config = await this.repo.findOne({
            where: { clave: 'WA_PHONE_NUMBER_ID', valor: phoneNumberId, estado: constants_1.Status.ACTIVE },
        });
        return config?.clienteId ?? null;
    }
    async resolverClientePorVerifyToken(verifyToken) {
        const config = await this.repo.findOne({
            where: { clave: 'WA_VERIFY_TOKEN', valor: verifyToken, estado: constants_1.Status.ACTIVE },
        });
        return config?.clienteId ?? null;
    }
};
ConfiguracionClienteService = ConfiguracionClienteService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(configuracion_cliente_entity_1.ConfiguracionCliente)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ConfiguracionClienteService);
exports.ConfiguracionClienteService = ConfiguracionClienteService;
//# sourceMappingURL=configuracion-cliente.service.js.map