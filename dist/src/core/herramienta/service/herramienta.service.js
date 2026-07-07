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
var HerramientaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HerramientaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const herramienta_entity_1 = require("../entity/herramienta.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
let HerramientaService = HerramientaService_1 = class HerramientaService extends base_service_1.BaseService {
    constructor(herramientaRepository) {
        super(HerramientaService_1.name);
        this.herramientaRepository = herramientaRepository;
    }
    async listarPorAgente(agenteId) {
        return this.herramientaRepository.find({
            where: { agenteId, estado: constants_1.Status.ACTIVE },
            order: { fechaCreacion: 'ASC' },
        });
    }
    async obtener(id) {
        const h = await this.herramientaRepository.findOne({ where: { id, estado: constants_1.Status.ACTIVE } });
        if (!h)
            throw new common_1.NotFoundException(response_messages_1.Messages.HERRAMIENTA_NOT_FOUND);
        return h;
    }
    async crear(dto, usuarioCreacion) {
        const herramienta = this.herramientaRepository.create({
            ...dto,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.herramientaRepository.save(herramienta);
    }
    async actualizar(id, dto, usuarioModificacion) {
        const h = await this.obtener(id);
        Object.assign(h, { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.herramientaRepository.save(h);
    }
    async eliminar(id, usuarioModificacion) {
        const h = await this.obtener(id);
        h.estado = constants_1.Status.ELIMINATE;
        h.transaccion = constants_1.Transacccion.ELIMINAR;
        h.usuarioModificacion = usuarioModificacion;
        await this.herramientaRepository.save(h);
    }
    async crearHerramientasPorDefecto(agenteId, usuarioCreacion) {
        const defaults = [
            {
                nombre: 'calificar_lead',
                label: 'Calificar Lead',
                descripcion: 'Actualiza el Lead Score (0-100) según el contenido de la conversación.',
                parametros: [
                    { nombre: 'score', tipo: 'integer', descripcion: 'Valor del score entre 0 y 100', requerido: true, minimo: 0, maximo: 100 },
                    { nombre: 'razon', tipo: 'string', descripcion: 'Justificación del score asignado', requerido: true },
                ],
                activa: true, autoConfirmar: true, confianzaMinima: 70, color: '#f59e0b', icono: 'qualify',
                ejemplo: 'calificar_lead({ score: 82, razon: "Mencionó presupuesto disponible" })',
            },
            {
                nombre: 'cambiar_estado',
                label: 'Cambiar Estado',
                descripcion: 'Cambia el estado de la conversación.',
                parametros: [
                    { nombre: 'estado', tipo: 'enum', descripcion: 'Nuevo estado de la conversación', requerido: true, opciones: ['nuevo', 'abierto', 'pendiente', 'resuelto', 'cerrado'] },
                ],
                activa: true, autoConfirmar: true, confianzaMinima: 80, color: '#6366f1', icono: 'check',
            },
            {
                nombre: 'escalar_agente',
                label: 'Escalar a Humano',
                descripcion: 'Transfiere la conversación a un agente humano con contexto completo.',
                parametros: [
                    { nombre: 'razon', tipo: 'string', descripcion: 'Motivo por el que se escala la conversación', requerido: true },
                    { nombre: 'prioridad', tipo: 'enum', descripcion: 'Nivel de urgencia', requerido: true, opciones: ['alta', 'media', 'baja'] },
                ],
                activa: true, autoConfirmar: true, confianzaMinima: 60, color: '#ef4444', icono: 'user',
            },
            {
                nombre: 'crear_nota',
                label: 'Crear Nota Interna',
                descripcion: 'Agrega una nota interna visible solo para el equipo.',
                parametros: [
                    { nombre: 'nota', tipo: 'string', descripcion: 'Contenido de la nota interna', requerido: true },
                ],
                activa: true, autoConfirmar: true, confianzaMinima: 50, color: '#64748b', icono: 'edit',
            },
            {
                nombre: 'buscar_producto',
                label: 'Buscar Producto',
                descripcion: 'Busca productos en el catálogo según lo que pide el cliente. Úsala cuando pregunten por productos, precios, disponibilidad, marca o modelo.',
                parametros: [
                    { nombre: 'termino', tipo: 'string', descripcion: 'Término de búsqueda: nombre, marca, modelo o categoría del producto', requerido: true },
                    { nombre: 'categoria', tipo: 'string', descripcion: 'Filtrar por categoría específica (opcional)', requerido: false },
                ],
                activa: true, autoConfirmar: true, confianzaMinima: 50, color: '#10b981', icono: 'search',
                ejemplo: 'buscar_producto({ termino: "zapatillas Nike", categoria: "calzado" })',
            },
        ];
        for (const d of defaults) {
            await this.crear({ agenteId, ...d }, usuarioCreacion);
        }
    }
    convertirAFormatoClaudeTools(herramientas) {
        return herramientas
            .filter(h => h.activa)
            .map(h => ({
            name: h.nombre,
            description: h.descripcion,
            input_schema: this.construirInputSchema(h.parametros),
        }));
    }
    construirInputSchema(parametros) {
        const properties = {};
        const required = [];
        for (const p of parametros ?? []) {
            if (typeof p === 'string') {
                const { nombre, schema } = this.parsearParametroLegacy(p);
                properties[nombre] = schema;
                required.push(nombre);
                continue;
            }
            const param = p;
            if (param.tipo === 'enum') {
                properties[param.nombre] = { type: 'string', enum: param.opciones ?? [], description: param.descripcion };
            }
            else if (param.tipo === 'integer') {
                const schema = { type: 'integer', description: param.descripcion };
                if (param.minimo !== undefined)
                    schema.minimum = param.minimo;
                if (param.maximo !== undefined)
                    schema.maximum = param.maximo;
                properties[param.nombre] = schema;
            }
            else if (param.tipo === 'number') {
                const schema = { type: 'number', description: param.descripcion };
                if (param.minimo !== undefined)
                    schema.minimum = param.minimo;
                if (param.maximo !== undefined)
                    schema.maximum = param.maximo;
                properties[param.nombre] = schema;
            }
            else {
                properties[param.nombre] = { type: param.tipo, description: param.descripcion };
            }
            if (param.requerido)
                required.push(param.nombre);
        }
        return { type: 'object', properties, required };
    }
    parsearParametroLegacy(param) {
        const colonIdx = param.indexOf(':');
        if (colonIdx === -1)
            return { nombre: param.trim(), schema: { type: 'string' } };
        const nombre = param.substring(0, colonIdx).trim();
        const resto = param.substring(colonIdx + 1).trim();
        if (resto.includes('|')) {
            const opciones = resto.split('|').map(o => o.replace(/['"()\s]/g, '').trim()).filter(Boolean);
            return { nombre, schema: { type: 'string', enum: opciones, description: resto } };
        }
        if (resto.startsWith('number') || resto.startsWith('int')) {
            return { nombre, schema: { type: 'number', description: resto } };
        }
        return { nombre, schema: { type: 'string', description: resto } };
    }
};
HerramientaService = HerramientaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(herramienta_entity_1.Herramienta)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], HerramientaService);
exports.HerramientaService = HerramientaService;
//# sourceMappingURL=herramienta.service.js.map