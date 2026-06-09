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
var ClienteService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClienteService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cliente_entity_1 = require("../entity/cliente.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
let ClienteService = ClienteService_1 = class ClienteService extends base_service_1.BaseService {
    constructor(clienteRepository, dataSource) {
        super(ClienteService_1.name);
        this.clienteRepository = clienteRepository;
        this.dataSource = dataSource;
    }
    async listar() {
        return this.clienteRepository.find({
            where: { estado: constants_1.Status.ACTIVE },
            order: { fechaCreacion: 'DESC' },
        });
    }
    async obtener(id) {
        const cliente = await this.clienteRepository.findOne({ where: { id, estado: constants_1.Status.ACTIVE } });
        if (!cliente)
            throw new common_1.NotFoundException(response_messages_1.Messages.CLIENTE_NOT_FOUND);
        return cliente;
    }
    async obtenerPorSlug(slug) {
        const cliente = await this.clienteRepository.findOne({ where: { slug, estado: constants_1.Status.ACTIVE } });
        if (!cliente)
            throw new common_1.NotFoundException(response_messages_1.Messages.CLIENTE_NOT_FOUND);
        return cliente;
    }
    async crear(dto, usuarioCreacion) {
        const existe = await this.clienteRepository.findOne({ where: { slug: dto.slug, estado: constants_1.Status.ACTIVE } });
        if (existe)
            throw new common_1.ConflictException(`Ya existe un cliente con el slug '${dto.slug}'.`);
        const cliente = this.clienteRepository.create({
            ...dto,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
            activo: true,
            diasAtencion: dto.diasAtencion ?? [],
            servicios: dto.servicios ?? [],
        });
        return this.clienteRepository.save(cliente);
    }
    async actualizar(id, dto, usuarioModificacion) {
        const cliente = await this.obtener(id);
        if (dto.slug && dto.slug !== cliente.slug) {
            const existe = await this.clienteRepository.findOne({ where: { slug: dto.slug, estado: constants_1.Status.ACTIVE } });
            if (existe)
                throw new common_1.ConflictException(`Ya existe un cliente con el slug '${dto.slug}'.`);
        }
        Object.assign(cliente, { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.clienteRepository.save(cliente);
    }
    async eliminar(id, usuarioModificacion) {
        const cliente = await this.obtener(id);
        cliente.estado = constants_1.Status.ELIMINATE;
        cliente.transaccion = constants_1.Transacccion.ELIMINAR;
        cliente.usuarioModificacion = usuarioModificacion;
        await this.clienteRepository.save(cliente);
    }
    async resumen(id) {
        await this.obtener(id);
        const s = process.env.DB_SCHEMA || 'public';
        const act = constants_1.Status.ACTIVE;
        const [ag, conv, usr, rs, cfg] = await Promise.all([
            this.dataSource.query(`SELECT COUNT(*) FROM ${s}.agente WHERE cliente_id=$1 AND _estado=$2`, [id, act]),
            this.dataSource.query(`SELECT COUNT(*) FROM ${s}.conversacion WHERE cliente_id=$1 AND _estado=$2`, [id, act]),
            this.dataSource.query(`SELECT COUNT(*) FROM ${s}.usuario WHERE cliente_id=$1 AND _estado=$2`, [id, act]),
            this.dataSource.query(`SELECT COUNT(*) FROM ${s}.red_social_cuenta WHERE cliente_id=$1 AND _estado=$2`, [id, act]),
            this.dataSource.query(`SELECT COUNT(*) FROM ${s}.configuracion_cliente WHERE cliente_id=$1 AND _estado=$2`, [id, act]),
        ]);
        return {
            agentes: parseInt(ag[0].count, 10),
            conversaciones: parseInt(conv[0].count, 10),
            usuarios: parseInt(usr[0].count, 10),
            cuentasRedesSociales: parseInt(rs[0].count, 10),
            configuraciones: parseInt(cfg[0].count, 10),
        };
    }
};
ClienteService = ClienteService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cliente_entity_1.Cliente)),
    __param(1, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], ClienteService);
exports.ClienteService = ClienteService;
//# sourceMappingURL=cliente.service.js.map