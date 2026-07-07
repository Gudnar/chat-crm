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
var OportunidadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OportunidadService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const oportunidad_venta_entity_1 = require("../entity/oportunidad-venta.entity");
const conversacion_entity_1 = require("../../conversacion/entity/conversacion.entity");
const usuario_entity_1 = require("../../usuario/entity/usuario.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
let OportunidadService = OportunidadService_1 = class OportunidadService extends base_service_1.BaseService {
    constructor(repo, conversacionRepo, usuarioRepo) {
        super(OportunidadService_1.name);
        this.repo = repo;
        this.conversacionRepo = conversacionRepo;
        this.usuarioRepo = usuarioRepo;
    }
    async nombreUsuario(usuarioId) {
        if (!usuarioId)
            return 'Sistema';
        const u = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
        return u ? `${u.nombres}${u.apellidos ? ' ' + u.apellidos : ''}` : `Usuario ${usuarioId}`;
    }
    entradaHistorial(accion, usuarioId, usuarioNombre, detalles) {
        return { timestamp: new Date().toISOString(), accion, usuarioId, usuarioNombre, detalles };
    }
    async sincronizarDesdeConversacion(items) {
        const conConversacion = items.filter(o => o.conversacionId);
        if (!conConversacion.length)
            return;
        const ids = [...new Set(conConversacion.map(o => String(o.conversacionId)))];
        const convs = await this.conversacionRepo.find({ where: { id: (0, typeorm_2.In)(ids) } });
        const porId = new Map(convs.map(c => [String(c.id), c]));
        for (const o of conConversacion) {
            const conv = porId.get(String(o.conversacionId));
            if (!conv)
                continue;
            const updates = {};
            const nombreAsignado = conv.notas && conv.notas.startsWith('Nombre:')
                ? conv.notas.replace('Nombre:', '').trim()
                : null;
            if (nombreAsignado && o.contactoNombre !== nombreAsignado) {
                updates.contactoNombre = nombreAsignado;
            }
            if (!o.fechaPrimerContacto) {
                const primerMensaje = (conv.mensajes || []).find(m => m.role === 'user') || (conv.mensajes || [])[0];
                const fecha = primerMensaje?.timestamp ? new Date(primerMensaje.timestamp) : conv.fechaCreacion || null;
                if (fecha)
                    updates.fechaPrimerContacto = fecha;
            }
            if (Object.keys(updates).length) {
                Object.assign(o, updates);
                await this.repo.update(o.id, updates);
            }
        }
    }
    async generarNumero(clienteId) {
        const ultimo = await this.repo.createQueryBuilder('o')
            .select('MAX(o.id)', 'max')
            .where('o.clienteId = :clienteId', { clienteId })
            .getRawOne();
        const siguiente = (parseInt(ultimo?.max, 10) || 0) + 1;
        return `OPP-${String(siguiente).padStart(4, '0')}-${clienteId}`;
    }
    async listar(clienteId, filtros = {}, pagina = 1, limite = 25) {
        const qb = this.repo.createQueryBuilder('o')
            .where('o.clienteId = :clienteId', { clienteId })
            .andWhere('o.estado = :estado', { estado: constants_1.Status.ACTIVE });
        if (filtros.estadoOportunidad) {
            qb.andWhere('o.estadoOportunidad = :estadoOportunidad', { estadoOportunidad: filtros.estadoOportunidad });
        }
        if (filtros.prioridad)
            qb.andWhere('o.prioridad = :prioridad', { prioridad: filtros.prioridad });
        if (filtros.asignadoA)
            qb.andWhere('o.asignadoA = :asignadoA', { asignadoA: filtros.asignadoA });
        if (filtros.q) {
            qb.andWhere('(o.contactoNombre ILIKE :q OR o.empresa ILIKE :q OR o.contactoTelefono ILIKE :q OR o.productoInteres ILIKE :q OR o.numeroOportunidad ILIKE :q)', { q: `%${filtros.q}%` });
        }
        const total = await qb.getCount();
        const totalPaginas = Math.max(1, Math.ceil(total / limite));
        const paginaSegura = Math.min(Math.max(1, pagina), totalPaginas);
        const items = await qb.clone()
            .orderBy('o.fechaCreacion', 'DESC')
            .skip((paginaSegura - 1) * limite)
            .take(limite)
            .getMany();
        await this.sincronizarDesdeConversacion(items);
        return { items, total, pagina: paginaSegura, totalPaginas, limite };
    }
    async obtener(id, clienteId) {
        const o = await this.repo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!o)
            throw new common_1.NotFoundException('Oportunidad no encontrada');
        await this.sincronizarDesdeConversacion([o]);
        return o;
    }
    async crear(dto, clienteId, usuarioId) {
        const usuarioNombre = await this.nombreUsuario(usuarioId);
        const numeroOportunidad = await this.generarNumero(clienteId);
        let contactoNombre = dto.contactoNombre;
        let contactoTelefono = dto.contactoTelefono;
        let origen = dto.origen;
        let fechaPrimerContacto = null;
        if (dto.conversacionId) {
            const conv = await this.conversacionRepo.findOne({
                where: { id: dto.conversacionId, clienteId, estado: constants_1.Status.ACTIVE },
            });
            if (conv) {
                const nombreAsignado = conv.notas && conv.notas.startsWith('Nombre:')
                    ? conv.notas.replace('Nombre:', '').trim()
                    : null;
                contactoNombre = nombreAsignado || contactoNombre || conv.contacto;
                contactoTelefono = contactoTelefono || conv.contacto;
                origen = origen || (conv.canal === 'chat' ? 'web' : conv.canal);
                const primerMensaje = (conv.mensajes || []).find(m => m.role === 'user') || (conv.mensajes || [])[0];
                fechaPrimerContacto = primerMensaje?.timestamp
                    ? new Date(primerMensaje.timestamp)
                    : conv.fechaCreacion || null;
            }
        }
        let asignadoNombre = null;
        if (dto.asignadoA)
            asignadoNombre = await this.nombreUsuario(dto.asignadoA);
        const oportunidad = this.repo.create({
            numeroOportunidad,
            estadoOportunidad: constants_1.EstadoOportunidad.PROSPECTO,
            prioridad: dto.prioridad || 'media',
            montoEstimado: dto.montoEstimado ?? null,
            moneda: dto.moneda || 'USD',
            contactoNombre,
            contactoTelefono: contactoTelefono || null,
            contactoEmail: dto.contactoEmail || null,
            empresa: dto.empresa || null,
            origen: origen || 'otro',
            productoInteres: dto.productoInteres || null,
            conversacionId: dto.conversacionId || null,
            fechaPrimerContacto,
            asignadoA: dto.asignadoA || null,
            asignadoNombre,
            notas: dto.notas || null,
            historial: [
                this.entradaHistorial('creacion', usuarioId, usuarioNombre, `Oportunidad ${numeroOportunidad} creada`),
            ],
            clienteId,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion: usuarioId,
        });
        return this.repo.save(oportunidad);
    }
    async actualizar(id, dto, clienteId, usuarioId) {
        const o = await this.obtener(id, clienteId);
        const usuarioNombre = await this.nombreUsuario(usuarioId);
        const cambios = Object.entries(dto)
            .filter(([k, v]) => v !== undefined && o[k] !== v)
            .map(([k]) => k);
        Object.assign(o, dto);
        if (cambios.length) {
            o.historial = [
                ...(o.historial || []),
                this.entradaHistorial('edicion', usuarioId, usuarioNombre, `Campos editados: ${cambios.join(', ')}`),
            ];
        }
        o.transaccion = constants_1.Transacccion.ACTUALIZAR;
        o.usuarioModificacion = usuarioId;
        return this.repo.save(o);
    }
    async cambiarEstado(id, nuevoEstado, motivo, clienteId, usuarioId) {
        const o = await this.obtener(id, clienteId);
        if (o.estadoOportunidad === nuevoEstado)
            return o;
        const esFinal = constants_1.ESTADOS_OPORTUNIDAD_FINALES.includes(nuevoEstado);
        if ((nuevoEstado === constants_1.EstadoOportunidad.PERDIDA || nuevoEstado === constants_1.EstadoOportunidad.CANCELADA) && !motivo) {
            throw new common_1.BadRequestException('Debes indicar el motivo al marcar la oportunidad como perdida o cancelada');
        }
        const usuarioNombre = await this.nombreUsuario(usuarioId);
        const detalles = `${o.estadoOportunidad} → ${nuevoEstado}${motivo ? ` — ${motivo}` : ''}`;
        o.estadoOportunidad = nuevoEstado;
        if (esFinal) {
            o.fechaCierre = new Date();
            o.motivoCierre = motivo || null;
            o.proximaAccion = null;
            o.proximaAccionFecha = null;
        }
        else if (o.fechaCierre) {
            o.fechaCierre = null;
            o.motivoCierre = null;
        }
        o.historial = [...(o.historial || []), this.entradaHistorial('cambio-estado', usuarioId, usuarioNombre, detalles)];
        o.transaccion = constants_1.Transacccion.ACTUALIZAR;
        o.usuarioModificacion = usuarioId;
        return this.repo.save(o);
    }
    async asignar(id, asignadoA, clienteId, usuarioId) {
        const o = await this.obtener(id, clienteId);
        const usuarioNombre = await this.nombreUsuario(usuarioId);
        const asignadoNombre = await this.nombreUsuario(asignadoA);
        o.asignadoA = asignadoA;
        o.asignadoNombre = asignadoNombre;
        o.historial = [
            ...(o.historial || []),
            this.entradaHistorial('asignacion', usuarioId, usuarioNombre, `Asignada a ${asignadoNombre}`),
        ];
        o.transaccion = constants_1.Transacccion.ACTUALIZAR;
        o.usuarioModificacion = usuarioId;
        return this.repo.save(o);
    }
    async registrarSeguimiento(id, dto, clienteId, usuarioId) {
        const o = await this.obtener(id, clienteId);
        const usuarioNombre = await this.nombreUsuario(usuarioId);
        o.historial = [...(o.historial || []), this.entradaHistorial('seguimiento', usuarioId, usuarioNombre, dto.nota)];
        if (dto.proximaAccion !== undefined)
            o.proximaAccion = dto.proximaAccion || null;
        if (dto.proximaAccionFecha !== undefined) {
            o.proximaAccionFecha = dto.proximaAccionFecha ? new Date(dto.proximaAccionFecha) : null;
        }
        o.transaccion = constants_1.Transacccion.ACTUALIZAR;
        o.usuarioModificacion = usuarioId;
        return this.repo.save(o);
    }
    async eliminar(id, clienteId, usuarioId) {
        const o = await this.obtener(id, clienteId);
        o.estado = constants_1.Status.ELIMINATE;
        o.transaccion = constants_1.Transacccion.ELIMINAR;
        o.usuarioModificacion = usuarioId;
        await this.repo.save(o);
    }
    async estadisticas(clienteId, asignadoA) {
        const qbBase = () => {
            const qb = this.repo.createQueryBuilder('o')
                .where('o.clienteId = :clienteId', { clienteId })
                .andWhere('o.estado = :estado', { estado: constants_1.Status.ACTIVE });
            if (asignadoA)
                qb.andWhere('o.asignadoA = :asignadoA', { asignadoA });
            return qb;
        };
        const total = await qbBase().getCount();
        const porEstadoRaw = await qbBase()
            .select('o.estadoOportunidad', 'estado')
            .addSelect('COUNT(*)', 'count')
            .groupBy('o.estadoOportunidad')
            .getRawMany();
        const porEstado = porEstadoRaw.reduce((acc, r) => {
            acc[r.estado] = parseInt(r.count, 10);
            return acc;
        }, {});
        const pipelineRow = await qbBase()
            .select('COALESCE(SUM(o.montoEstimado), 0)', 'suma')
            .andWhere('o.estadoOportunidad NOT IN (:...finales)', { finales: constants_1.ESTADOS_OPORTUNIDAD_FINALES })
            .getRawOne();
        const ganadoRow = await qbBase()
            .select('COALESCE(SUM(o.montoEstimado), 0)', 'suma')
            .andWhere('o.estadoOportunidad = :ganada', { ganada: constants_1.EstadoOportunidad.GANADA })
            .getRawOne();
        const ganadas = porEstado[constants_1.EstadoOportunidad.GANADA] || 0;
        const perdidas = porEstado[constants_1.EstadoOportunidad.PERDIDA] || 0;
        const canceladas = porEstado[constants_1.EstadoOportunidad.CANCELADA] || 0;
        const cerradas = ganadas + perdidas + canceladas;
        const abiertas = total - cerradas;
        const vencidas = await qbBase()
            .andWhere('o.proximaAccionFecha < NOW()')
            .andWhere('o.estadoOportunidad NOT IN (:...finales)', { finales: constants_1.ESTADOS_OPORTUNIDAD_FINALES })
            .getCount();
        return {
            total,
            abiertas,
            ganadas,
            perdidas,
            canceladas,
            porEstado,
            montoPipeline: parseFloat(pipelineRow?.suma || '0'),
            montoGanado: parseFloat(ganadoRow?.suma || '0'),
            tasaConversion: cerradas > 0 ? Math.round((ganadas / cerradas) * 100) : 0,
            seguimientosVencidos: vencidas,
        };
    }
    async usuariosAsignables(clienteId) {
        const usuarios = await this.usuarioRepo.createQueryBuilder('u')
            .where('u.estado = :estado', { estado: constants_1.Status.ACTIVE })
            .andWhere('u.rol = :rol', { rol: constants_1.Roles.AGENTE_HUMANO })
            .andWhere('u.clienteId = :clienteId', { clienteId })
            .orderBy('u.nombres', 'ASC')
            .getMany();
        return usuarios.map(u => ({
            id: u.id,
            nombre: `${u.nombres}${u.apellidos ? ' ' + u.apellidos : ''}`,
            rol: u.rol,
        }));
    }
};
OportunidadService = OportunidadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(oportunidad_venta_entity_1.OportunidadVenta)),
    __param(1, (0, typeorm_1.InjectRepository)(conversacion_entity_1.Conversacion)),
    __param(2, (0, typeorm_1.InjectRepository)(usuario_entity_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], OportunidadService);
exports.OportunidadService = OportunidadService;
//# sourceMappingURL=oportunidad.service.js.map