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
var SoporteService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoporteService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const caso_entity_1 = require("../entity/caso.entity");
const conversacion_entity_1 = require("../../conversacion/entity/conversacion.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
let SoporteService = SoporteService_1 = class SoporteService extends base_service_1.BaseService {
    constructor(casoRepository, conversacionRepo) {
        super(SoporteService_1.name);
        this.casoRepository = casoRepository;
        this.conversacionRepo = conversacionRepo;
    }
    async generarNumeroCaso(clienteId) {
        const ultimo = await this.casoRepository.createQueryBuilder('c')
            .select('MAX(c.id)', 'max')
            .where('c.clienteId = :clienteId', { clienteId })
            .getRawOne();
        const siguiente = (parseInt(ultimo?.max, 10) || 0) + 1;
        return `CASO-${String(siguiente).padStart(4, '0')}-${clienteId}`;
    }
    async sincronizarDesdeConversacion(casos) {
        const conConversacion = casos.filter(c => c.conversacionId);
        if (!conConversacion.length)
            return;
        const ids = [...new Set(conConversacion.map(c => String(c.conversacionId)))];
        const convs = await this.conversacionRepo.find({ where: { id: (0, typeorm_2.In)(ids) } });
        const porId = new Map(convs.map(c => [String(c.id), c]));
        for (const caso of conConversacion) {
            const conv = porId.get(String(caso.conversacionId));
            if (!conv)
                continue;
            const updates = {};
            const nombreAsignado = conv.notas && conv.notas.startsWith('Nombre:')
                ? conv.notas.replace('Nombre:', '').trim()
                : null;
            if (nombreAsignado && caso.nombreContacto !== nombreAsignado) {
                updates.nombreContacto = nombreAsignado;
            }
            if (!caso.telefonoContacto)
                updates.telefonoContacto = conv.contacto;
            if (Object.keys(updates).length) {
                Object.assign(caso, updates);
                await this.casoRepository.update(caso.id, updates);
            }
        }
    }
    async listar(clienteId) {
        const casos = await this.casoRepository.find({
            where: { clienteId, estado: constants_1.Status.ACTIVE },
            order: { fechaCreacion: 'DESC' },
            take: 100,
        });
        await this.sincronizarDesdeConversacion(casos);
        return casos;
    }
    async obtener(id, clienteId) {
        const caso = await this.casoRepository.findOne({
            where: { id, clienteId, estado: constants_1.Status.ACTIVE }
        });
        if (!caso)
            throw new common_1.NotFoundException('Caso no encontrado');
        await this.sincronizarDesdeConversacion([caso]);
        return caso;
    }
    async crear(titulo, descripcion, nombreContacto, prioridad, categoria, clienteId, usuarioCreacion, conversacionId, telefonoContacto, emailContacto) {
        if (conversacionId) {
            const conv = await this.conversacionRepo.findOne({
                where: { id: conversacionId, clienteId, estado: constants_1.Status.ACTIVE },
            });
            if (conv) {
                const nombreAsignado = conv.notas && conv.notas.startsWith('Nombre:')
                    ? conv.notas.replace('Nombre:', '').trim()
                    : null;
                nombreContacto = nombreContacto || nombreAsignado || conv.contacto;
                telefonoContacto = telefonoContacto || conv.contacto;
                const ultimoDelCliente = [...(conv.mensajes || [])].reverse().find(m => m.role === 'user');
                titulo = titulo || `Atención a ${nombreContacto} (${conv.canal})`;
                descripcion = descripcion || (ultimoDelCliente
                    ? `Último mensaje del cliente: "${ultimoDelCliente.content}"`
                    : `Caso creado desde la conversación de ${conv.canal}`);
                categoria = categoria || conv.canal;
            }
        }
        const numeroCaso = await this.generarNumeroCaso(clienteId);
        const caso = this.casoRepository.create({
            numeroCaso,
            titulo,
            descripcion,
            nombreContacto,
            telefonoContacto: telefonoContacto || undefined,
            emailContacto: emailContacto || undefined,
            prioridad,
            categoria,
            conversacionId,
            clienteId,
            estadoCaso: 'abierto',
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
            historial: [{
                    timestamp: new Date().toISOString(),
                    accion: 'Caso creado',
                    usuario: usuarioCreacion,
                    detalles: conversacionId
                        ? `Caso ${numeroCaso} creado desde la conversación #${conversacionId}`
                        : `Caso ${numeroCaso} creado`,
                }],
        });
        return this.casoRepository.save(caso);
    }
    async actualizar(id, clienteId, updates) {
        const caso = await this.obtener(id, clienteId);
        if ('estadoCaso' in updates || 'prioridad' in updates || 'asignadoA' in updates) {
            const historialEntry = {
                timestamp: new Date().toISOString(),
                accion: 'Caso actualizado',
                usuario: updates.usuarioModificacion || 'sistema',
                detalles: Object.keys(updates)
                    .filter(k => k !== 'usuarioModificacion')
                    .map(k => `${k}: ${updates[k]}`)
                    .join(', '),
            };
            caso.historial = [...(caso.historial || []), historialEntry];
        }
        Object.assign(caso, updates);
        caso.transaccion = constants_1.Transacccion.ACTUALIZAR;
        if (updates.estadoCaso === 'resuelto' && !caso.fechaResolucion) {
            caso.fechaResolucion = new Date();
        }
        return this.casoRepository.save(caso);
    }
    async cambiarEstado(id, clienteId, nuevoEstado, usuarioId) {
        return this.actualizar(id, clienteId, {
            estadoCaso: nuevoEstado,
            usuarioModificacion: usuarioId,
        });
    }
    async agregarNota(id, clienteId, nota, usuarioId) {
        const caso = await this.obtener(id, clienteId);
        const entrada = {
            timestamp: new Date().toISOString(),
            accion: 'Nota agregada',
            usuario: usuarioId,
            detalles: nota,
        };
        caso.historial = [...(caso.historial || []), entrada];
        caso.transaccion = constants_1.Transacccion.ACTUALIZAR;
        return this.casoRepository.save(caso);
    }
    async estadisticas(clienteId) {
        const where = { clienteId, estado: constants_1.Status.ACTIVE };
        const total = await this.casoRepository.count({ where });
        const abiertos = await this.casoRepository.count({ where: { ...where, estadoCaso: 'abierto' } });
        const enProgreso = await this.casoRepository.count({ where: { ...where, estadoCaso: 'en_progreso' } });
        const resueltos = await this.casoRepository.count({ where: { ...where, estadoCaso: 'resuelto' } });
        const cerrados = await this.casoRepository.count({ where: { ...where, estadoCaso: 'cerrado' } });
        const porPrioridad = await this.casoRepository.createQueryBuilder('c')
            .where('c.cliente_id = :clienteId', { clienteId })
            .andWhere('c._estado = :estado', { estado: constants_1.Status.ACTIVE })
            .select('c.prioridad', 'prioridad')
            .addSelect('COUNT(*)', 'count')
            .groupBy('c.prioridad')
            .getRawMany();
        return {
            total,
            abiertos,
            enProgreso,
            resueltos,
            cerrados,
            porPrioridad: porPrioridad.reduce((acc, p) => {
                acc[p.prioridad] = parseInt(p.count, 10);
                return acc;
            }, {}),
        };
    }
};
SoporteService = SoporteService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(caso_entity_1.CasoSoporte)),
    __param(1, (0, typeorm_1.InjectRepository)(conversacion_entity_1.Conversacion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SoporteService);
exports.SoporteService = SoporteService;
//# sourceMappingURL=soporte.service.js.map