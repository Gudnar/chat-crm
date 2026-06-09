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
var UsuarioService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const usuario_entity_1 = require("../entity/usuario.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
let UsuarioService = UsuarioService_1 = class UsuarioService extends base_service_1.BaseService {
    constructor(usuarioRepository) {
        super(UsuarioService_1.name);
        this.usuarioRepository = usuarioRepository;
    }
    async buscarUsuario(usuario) {
        return this.usuarioRepository.findOne({ where: { usuario, estado: constants_1.Status.ACTIVE } });
    }
    async buscarUsuarioId(id) {
        const user = await this.usuarioRepository.findOne({ where: { id } });
        if (!user)
            return null;
        const { contrasena, ...rest } = user;
        return rest;
    }
    async listar() {
        return this.usuarioRepository.find({ where: { estado: constants_1.Status.ACTIVE } });
    }
    async crear(dto, usuarioCreacion) {
        const existe = await this.usuarioRepository.findOne({ where: { usuario: dto.usuario } });
        if (existe)
            throw new common_1.ConflictException(response_messages_1.Messages.CONFLICT);
        const nuevo = this.usuarioRepository.create({
            ...dto,
            rol: dto.rol || 'USER',
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.usuarioRepository.save(nuevo);
    }
    async actualizarContadorBloqueos(id, intentos) {
        await this.usuarioRepository.update(id, { intentos });
    }
    async actualizarDatosBloqueo(id, codigo, fecha) {
        await this.usuarioRepository.update(id, { fechaBloqueo: fecha, intentos: 0 });
    }
};
UsuarioService = UsuarioService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsuarioService);
exports.UsuarioService = UsuarioService;
//# sourceMappingURL=usuario.service.js.map