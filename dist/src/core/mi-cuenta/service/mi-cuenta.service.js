"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiCuentaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const usuario_entity_1 = require("../../usuario/entity/usuario.entity");
const cliente_entity_1 = require("../../cliente/entity/cliente.entity");
const rol_cliente_entity_1 = require("../entity/rol-cliente.entity");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
const PERMISOS_ADMIN = {
    agentes: { ver: true, crear: true, editar: true, eliminar: true },
    herramientas: { ver: true, gestionar: true },
    conversaciones: { ver: true, responder: true },
    reportes: { ver: true },
    configuracion: { ver: true, editar: true },
};
const PERMISOS_COLABORADOR = {
    agentes: { ver: true, crear: false, editar: false, eliminar: false },
    herramientas: { ver: true, gestionar: false },
    conversaciones: { ver: true, responder: true },
    reportes: { ver: true },
    configuracion: { ver: false, editar: false },
};
let MiCuentaService = class MiCuentaService {
    constructor(clienteRepo, usuarioRepo, rolRepo) {
        this.clienteRepo = clienteRepo;
        this.usuarioRepo = usuarioRepo;
        this.rolRepo = rolRepo;
    }
    async obtenerCliente(clienteId) {
        const cliente = await this.clienteRepo.findOne({
            where: { id: clienteId, estado: constants_1.Status.ACTIVE },
        });
        if (!cliente)
            throw new common_1.NotFoundException(response_messages_1.Messages.CLIENTE_NOT_FOUND);
        return cliente;
    }
    async actualizarCliente(clienteId, dto, usuarioModificacion) {
        const cliente = await this.obtenerCliente(clienteId);
        Object.assign(cliente, { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.clienteRepo.save(cliente);
    }
    async listarRoles(clienteId) {
        return this.rolRepo.find({
            where: { clienteId, estado: constants_1.Status.ACTIVE },
            order: { fechaCreacion: 'ASC' },
        });
    }
    async obtenerRol(clienteId, id) {
        const rol = await this.rolRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!rol)
            throw new common_1.NotFoundException('El rol no fue encontrado.');
        return rol;
    }
    async crearRol(clienteId, dto, usuarioCreacion) {
        const existe = await this.rolRepo.findOne({
            where: { clienteId, nombre: dto.nombre, estado: constants_1.Status.ACTIVE },
        });
        if (existe)
            throw new common_1.ConflictException(`Ya existe un rol con el nombre "${dto.nombre}".`);
        const rol = this.rolRepo.create({
            clienteId,
            nombre: dto.nombre,
            descripcion: dto.descripcion,
            permisos: dto.permisos ?? {},
            esBase: false,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.rolRepo.save(rol);
    }
    async actualizarRol(clienteId, id, dto, usuarioModificacion) {
        const rol = await this.obtenerRol(clienteId, id);
        if (dto.nombre && dto.nombre !== rol.nombre) {
            const existe = await this.rolRepo.findOne({
                where: { clienteId, nombre: dto.nombre, estado: constants_1.Status.ACTIVE },
            });
            if (existe)
                throw new common_1.ConflictException(`Ya existe un rol con el nombre "${dto.nombre}".`);
        }
        Object.assign(rol, { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.rolRepo.save(rol);
    }
    async eliminarRol(clienteId, id, usuarioModificacion) {
        const rol = await this.obtenerRol(clienteId, id);
        if (rol.esBase)
            throw new common_1.ForbiddenException('Los roles base no pueden eliminarse.');
        await this.usuarioRepo
            .createQueryBuilder()
            .update(usuario_entity_1.Usuario)
            .set({ rolClienteId: null })
            .where('rol_cliente_id = :id AND cliente_id = :clienteId', { id, clienteId })
            .execute();
        Object.assign(rol, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.rolRepo.save(rol);
    }
    async crearRolesBase(clienteId, usuarioCreacion) {
        const roles = [
            { nombre: 'Administrador', descripcion: 'Acceso completo a todos los módulos', permisos: PERMISOS_ADMIN, esBase: true },
            { nombre: 'Colaborador', descripcion: 'Acceso limitado de solo lectura y respuesta', permisos: PERMISOS_COLABORADOR, esBase: true },
        ];
        for (const r of roles) {
            const existe = await this.rolRepo.findOne({ where: { clienteId, nombre: r.nombre } });
            if (!existe) {
                await this.rolRepo.save(this.rolRepo.create({
                    ...r, clienteId,
                    estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion,
                }));
            }
        }
    }
    async contarUsuariosPorRol(clienteId) {
        const rows = await this.usuarioRepo
            .createQueryBuilder('u')
            .select('u.rolClienteId', 'rolId')
            .addSelect('COUNT(*)', 'total')
            .where('u.clienteId = :clienteId AND u._estado = :estado AND u.rolClienteId IS NOT NULL', {
            clienteId, estado: constants_1.Status.ACTIVE,
        })
            .groupBy('u.rolClienteId')
            .getRawMany();
        return rows.reduce((acc, r) => { acc[r.rolId] = Number(r.total); return acc; }, {});
    }
    async listarUsuarios(clienteId) {
        const usuarios = await this.usuarioRepo.find({
            where: { clienteId, estado: constants_1.Status.ACTIVE },
        });
        const roles = await this.listarRoles(clienteId);
        const rolesMap = Object.fromEntries(roles.map(r => [r.id, r.nombre]));
        return usuarios.map(({ contrasena, ...rest }) => ({
            ...rest,
            rolClienteNombre: rest.rolClienteId ? (rolesMap[rest.rolClienteId] ?? null) : null,
        }));
    }
    async crearUsuario(clienteId, dto, usuarioCreacion) {
        const existe = await this.usuarioRepo.findOne({ where: { usuario: dto.usuario } });
        if (existe)
            throw new common_1.ConflictException(response_messages_1.Messages.CONFLICT);
        if (dto.rolClienteId)
            await this.obtenerRol(clienteId, dto.rolClienteId);
        const nuevo = this.usuarioRepo.create({
            ...dto,
            clienteId,
            rol: dto.rol || constants_1.Roles.COLABORADOR,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        const saved = await this.usuarioRepo.save(nuevo);
        const { contrasena, ...rest } = saved;
        return rest;
    }
    async actualizarUsuario(clienteId, id, dto, usuarioModificacion) {
        const usuario = await this.usuarioRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!usuario)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        if (dto.rolClienteId)
            await this.obtenerRol(clienteId, dto.rolClienteId);
        const actualizado = { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion };
        if (dto.contrasena) {
            actualizado.contrasena = await bcrypt.hash(dto.contrasena, 10);
        }
        else {
            delete actualizado.contrasena;
        }
        Object.assign(usuario, actualizado);
        const saved = await this.usuarioRepo.save(usuario);
        const { contrasena, ...rest } = saved;
        return rest;
    }
    async eliminarUsuario(clienteId, id, usuarioModificacion) {
        const usuario = await this.usuarioRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!usuario)
            throw new common_1.NotFoundException(response_messages_1.Messages.NOT_FOUND);
        if (id === usuarioModificacion)
            throw new common_1.ForbiddenException('No puedes eliminar tu propio usuario.');
        Object.assign(usuario, { estado: constants_1.Status.ELIMINATE, transaccion: constants_1.Transacccion.ELIMINAR, usuarioModificacion });
        await this.usuarioRepo.save(usuario);
    }
};
MiCuentaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cliente_entity_1.Cliente)),
    __param(1, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __param(2, (0, typeorm_1.InjectRepository)(rol_cliente_entity_1.RolCliente)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MiCuentaService);
exports.MiCuentaService = MiCuentaService;
//# sourceMappingURL=mi-cuenta.service.js.map