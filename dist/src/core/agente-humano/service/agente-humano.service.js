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
var AgenteHumanoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgenteHumanoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const agente_entity_1 = require("../../agente/entity/agente.entity");
const usuario_entity_1 = require("../../usuario/entity/usuario.entity");
const asignacion_agente_humano_entity_1 = require("../entity/asignacion-agente-humano.entity");
const actividad_agente_humano_entity_1 = require("../entity/actividad-agente-humano.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
let AgenteHumanoService = AgenteHumanoService_1 = class AgenteHumanoService extends base_service_1.BaseService {
    constructor(agenteRepository, usuarioRepository, asignacionRepository, actividadRepository) {
        super(AgenteHumanoService_1.name);
        this.agenteRepository = agenteRepository;
        this.usuarioRepository = usuarioRepository;
        this.asignacionRepository = asignacionRepository;
        this.actividadRepository = actividadRepository;
    }
    async crear(dto, usuarioCreacion, clienteId) {
        const existe = await this.usuarioRepository.findOne({ where: { usuario: dto.usuario } });
        if (existe)
            throw new common_1.ConflictException(`El usuario "${dto.usuario}" ya existe.`);
        const nuevoUsuario = this.usuarioRepository.create({
            usuario: dto.usuario,
            contrasena: dto.contrasena,
            nombres: dto.nombres,
            apellidos: dto.apellidos,
            correoElectronico: dto.correoElectronico,
            rol: constants_1.Roles.AGENTE_HUMANO,
            clienteId,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario);
        const nombreCompleto = [dto.nombres, dto.apellidos].filter(Boolean).join(' ');
        const agente = this.agenteRepository.create({
            nombre: nombreCompleto,
            descripcion: dto.descripcion,
            tipoAgente: constants_1.TipoAgente.HUMANO,
            usuarioId: usuarioGuardado.id,
            estadoDisponibilidad: constants_1.DisponibilidadAgente.INACTIVO,
            avatar: dto.avatar || '🧑‍💼',
            color: dto.color || '#22c55e',
            especialidades: dto.especialidades ?? [],
            horasTrabajo: dto.horasTrabajo ?? {},
            clienteId,
            activo: true,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        const agenteGuardado = await this.agenteRepository.save(agente);
        await this.registrarActividad(agenteGuardado.id, clienteId, constants_1.TipoActividadAgente.ASIGNACION, {
            accion: 'agente_creado',
            creadoPor: usuarioCreacion,
        });
        return this.sanitizar(agenteGuardado, usuarioGuardado);
    }
    async listar(clienteId) {
        const agentes = await this.agenteRepository.find({
            where: { clienteId, tipoAgente: constants_1.TipoAgente.HUMANO, estado: constants_1.Status.ACTIVE },
            order: { fechaCreacion: 'ASC' },
        });
        if (agentes.length === 0)
            return [];
        const usuarioIds = agentes.map(a => a.usuarioId).filter(Boolean);
        const usuarios = usuarioIds.length
            ? await this.usuarioRepository.findByIds(usuarioIds)
            : [];
        const usuariosMap = Object.fromEntries(usuarios.map(u => [u.id, u]));
        const conActivas = await Promise.all(agentes.map(async (a) => {
            const activas = await this.asignacionRepository.count({
                where: { agenteHumanoId: a.id, estadoAsignacion: 'activa', estado: constants_1.Status.ACTIVE },
            });
            return this.sanitizar(a, usuariosMap[a.usuarioId], activas);
        }));
        return conActivas;
    }
    async obtener(id, clienteId) {
        const agente = await this.agenteRepository.findOne({
            where: { id, clienteId, tipoAgente: constants_1.TipoAgente.HUMANO, estado: constants_1.Status.ACTIVE },
        });
        if (!agente)
            throw new common_1.NotFoundException('El agente humano no fue encontrado.');
        const usuario = agente.usuarioId
            ? await this.usuarioRepository.findOne({ where: { id: agente.usuarioId } })
            : null;
        return this.sanitizar(agente, usuario);
    }
    async obtenerPorUsuarioId(usuarioId) {
        return this.agenteRepository.findOne({
            where: { usuarioId, tipoAgente: constants_1.TipoAgente.HUMANO, estado: constants_1.Status.ACTIVE },
        });
    }
    async actualizar(id, dto, usuarioModificacion, clienteId) {
        const agente = await this.agenteRepository.findOne({
            where: { id, clienteId, tipoAgente: constants_1.TipoAgente.HUMANO, estado: constants_1.Status.ACTIVE },
        });
        if (!agente)
            throw new common_1.NotFoundException('El agente humano no fue encontrado.');
        let usuario = null;
        if (agente.usuarioId) {
            usuario = await this.usuarioRepository.findOne({ where: { id: agente.usuarioId } });
            if (usuario) {
                if (dto.nombres !== undefined)
                    usuario.nombres = dto.nombres;
                if (dto.apellidos !== undefined)
                    usuario.apellidos = dto.apellidos;
                if (dto.correoElectronico !== undefined)
                    usuario.correoElectronico = dto.correoElectronico;
                if (dto.contrasena)
                    usuario.contrasena = await bcrypt.hash(dto.contrasena, 10);
                usuario.transaccion = constants_1.Transacccion.ACTUALIZAR;
                usuario.usuarioModificacion = usuarioModificacion;
                usuario = await this.usuarioRepository.save(usuario);
            }
        }
        if (dto.nombres !== undefined || dto.apellidos !== undefined) {
            const nombres = dto.nombres ?? usuario?.nombres ?? agente.nombre;
            const apellidos = dto.apellidos ?? usuario?.apellidos ?? '';
            agente.nombre = [nombres, apellidos].filter(Boolean).join(' ');
        }
        if (dto.descripcion !== undefined)
            agente.descripcion = dto.descripcion;
        if (dto.avatar !== undefined)
            agente.avatar = dto.avatar;
        if (dto.color !== undefined)
            agente.color = dto.color;
        if (dto.especialidades !== undefined)
            agente.especialidades = dto.especialidades;
        if (dto.horasTrabajo !== undefined)
            agente.horasTrabajo = dto.horasTrabajo;
        if (dto.activo !== undefined)
            agente.activo = dto.activo;
        agente.transaccion = constants_1.Transacccion.ACTUALIZAR;
        agente.usuarioModificacion = usuarioModificacion;
        const guardado = await this.agenteRepository.save(agente);
        return this.sanitizar(guardado, usuario);
    }
    async eliminar(id, usuarioModificacion, clienteId) {
        const agente = await this.agenteRepository.findOne({
            where: { id, clienteId, tipoAgente: constants_1.TipoAgente.HUMANO, estado: constants_1.Status.ACTIVE },
        });
        if (!agente)
            throw new common_1.NotFoundException('El agente humano no fue encontrado.');
        await this.asignacionRepository.update({ agenteHumanoId: id, estadoAsignacion: 'activa' }, { estadoAsignacion: 'cerrada', fechaCierre: new Date(), transaccion: constants_1.Transacccion.ACTUALIZAR });
        Object.assign(agente, {
            estado: constants_1.Status.ELIMINATE,
            transaccion: constants_1.Transacccion.ELIMINAR,
            usuarioModificacion,
            sesionActiva: false,
            estadoDisponibilidad: constants_1.DisponibilidadAgente.INACTIVO,
        });
        await this.agenteRepository.save(agente);
        if (agente.usuarioId) {
            await this.usuarioRepository.update(agente.usuarioId, {
                estado: constants_1.Status.ELIMINATE,
                transaccion: constants_1.Transacccion.ELIMINAR,
                usuarioModificacion,
            });
        }
    }
    async cambiarDisponibilidad(agenteId, estado, clienteId) {
        const agente = await this.agenteRepository.findOne({
            where: { id: agenteId, clienteId, tipoAgente: constants_1.TipoAgente.HUMANO, estado: constants_1.Status.ACTIVE },
        });
        if (!agente)
            throw new common_1.NotFoundException('El agente humano no fue encontrado.');
        const anterior = agente.estadoDisponibilidad;
        agente.estadoDisponibilidad = estado;
        agente.transaccion = constants_1.Transacccion.ACTUALIZAR;
        await this.agenteRepository.save(agente);
        await this.registrarActividad(agenteId, clienteId, constants_1.TipoActividadAgente.CAMBIO_ESTADO, {
            de: anterior,
            a: estado,
        });
        return { estadoDisponibilidad: estado };
    }
    async obtenerDisponibles(clienteId) {
        const agentes = await this.agenteRepository.find({
            where: {
                clienteId,
                tipoAgente: constants_1.TipoAgente.HUMANO,
                estadoDisponibilidad: constants_1.DisponibilidadAgente.DISPONIBLE,
                activo: true,
                estado: constants_1.Status.ACTIVE,
            },
        });
        return agentes.map(a => this.sanitizar(a, null));
    }
    async registrarSesion(usuarioId) {
        const agente = await this.obtenerPorUsuarioId(usuarioId);
        if (!agente)
            return;
        agente.sesionActiva = true;
        agente.ultimoAcceso = new Date();
        if (agente.estadoDisponibilidad === constants_1.DisponibilidadAgente.INACTIVO) {
            agente.estadoDisponibilidad = constants_1.DisponibilidadAgente.DISPONIBLE;
        }
        agente.transaccion = constants_1.Transacccion.ACTUALIZAR;
        await this.agenteRepository.save(agente);
        await this.registrarActividad(agente.id, agente.clienteId, constants_1.TipoActividadAgente.LOGIN, {});
    }
    async cerrarSesion(usuarioId) {
        const agente = await this.obtenerPorUsuarioId(usuarioId);
        if (!agente)
            return;
        agente.sesionActiva = false;
        agente.estadoDisponibilidad = constants_1.DisponibilidadAgente.INACTIVO;
        agente.transaccion = constants_1.Transacccion.ACTUALIZAR;
        await this.agenteRepository.save(agente);
        await this.registrarActividad(agente.id, agente.clienteId, constants_1.TipoActividadAgente.LOGOUT, {});
    }
    async estadisticas(agenteId, clienteId) {
        const agente = await this.agenteRepository.findOne({
            where: { id: agenteId, clienteId, tipoAgente: constants_1.TipoAgente.HUMANO, estado: constants_1.Status.ACTIVE },
        });
        if (!agente)
            throw new common_1.NotFoundException('El agente humano no fue encontrado.');
        const base = { agenteHumanoId: agenteId, estado: constants_1.Status.ACTIVE };
        const [totalAsignadas, activas, resueltas, escaladas] = await Promise.all([
            this.asignacionRepository.count({ where: base }),
            this.asignacionRepository.count({ where: { ...base, estadoAsignacion: 'activa' } }),
            this.asignacionRepository.count({ where: { ...base, estadoAsignacion: 'cerrada' } }),
            this.asignacionRepository.count({ where: { ...base, fueEscalada: true } }),
        ]);
        const tiempoRow = await this.asignacionRepository
            .createQueryBuilder('a')
            .select('COALESCE(AVG(a.tiempo_atencion_segundos), 0)', 'avg')
            .where('a.agente_humano_id = :agenteId', { agenteId })
            .andWhere('a.tiempo_atencion_segundos IS NOT NULL')
            .getRawOne();
        const tiempoPromedioMinutos = Math.round(parseFloat(tiempoRow?.avg || '0') / 60);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const asignadasHoy = await this.asignacionRepository
            .createQueryBuilder('a')
            .where('a.agente_humano_id = :agenteId', { agenteId })
            .andWhere('a.fecha_asignacion >= :hoy', { hoy })
            .getCount();
        return {
            agenteId,
            nombre: agente.nombre,
            estadoDisponibilidad: agente.estadoDisponibilidad,
            sesionActiva: agente.sesionActiva,
            ultimoAcceso: agente.ultimoAcceso,
            totalAsignadas,
            activas,
            resueltas,
            escaladas,
            asignadasHoy,
            tiempoPromedioMinutos,
            tasaResolucion: totalAsignadas > 0 ? Math.round((resueltas / totalAsignadas) * 100) : 0,
        };
    }
    async estadisticasEquipo(clienteId) {
        const agentes = await this.agenteRepository.find({
            where: { clienteId, tipoAgente: constants_1.TipoAgente.HUMANO, estado: constants_1.Status.ACTIVE },
        });
        return Promise.all(agentes.map(a => this.estadisticas(a.id, clienteId)));
    }
    async actividad(agenteId, clienteId, limite = 50) {
        return this.actividadRepository.find({
            where: { agenteHumanoId: agenteId, clienteId },
            order: { timestamp: 'DESC' },
            take: limite,
        });
    }
    async registrarActividad(agenteHumanoId, clienteId, tipoActividad, detalles, conversacionId) {
        const registro = this.actividadRepository.create({
            agenteHumanoId,
            clienteId,
            tipoActividad,
            detalles,
            conversacionId: conversacionId ?? null,
        });
        await this.actividadRepository.save(registro);
    }
    sanitizar(agente, usuario, conversacionesActivas) {
        return {
            id: agente.id,
            nombre: agente.nombre,
            descripcion: agente.descripcion,
            tipoAgente: agente.tipoAgente,
            avatar: agente.avatar,
            color: agente.color,
            activo: agente.activo,
            estadoDisponibilidad: agente.estadoDisponibilidad,
            sesionActiva: agente.sesionActiva,
            ultimoAcceso: agente.ultimoAcceso,
            especialidades: agente.especialidades,
            horasTrabajo: agente.horasTrabajo,
            clienteId: agente.clienteId,
            usuarioId: agente.usuarioId,
            fechaCreacion: agente.fechaCreacion,
            ...(conversacionesActivas !== undefined && { conversacionesActivas }),
            ...(usuario && {
                credenciales: {
                    usuario: usuario.usuario,
                    nombres: usuario.nombres,
                    apellidos: usuario.apellidos,
                    correoElectronico: usuario.correoElectronico,
                },
            }),
        };
    }
};
AgenteHumanoService = AgenteHumanoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agente_entity_1.Agente)),
    __param(1, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __param(2, (0, typeorm_1.InjectRepository)(asignacion_agente_humano_entity_1.AsignacionAgenteHumano)),
    __param(3, (0, typeorm_1.InjectRepository)(actividad_agente_humano_entity_1.ActividadAgenteHumano)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AgenteHumanoService);
exports.AgenteHumanoService = AgenteHumanoService;
//# sourceMappingURL=agente-humano.service.js.map