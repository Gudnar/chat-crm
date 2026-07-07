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
var BaseConocimientoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseConocimientoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const base_conocimiento_entity_1 = require("../entity/base-conocimiento.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
let BaseConocimientoService = BaseConocimientoService_1 = class BaseConocimientoService extends base_service_1.BaseService {
    constructor(repo) {
        super(BaseConocimientoService_1.name);
        this.repo = repo;
    }
    async listarPorAgente(agenteId) {
        return this.repo.find({
            where: { agenteId, estado: constants_1.Status.ACTIVE },
            order: { orden: 'ASC', fechaCreacion: 'ASC' },
        });
    }
    async obtener(id) {
        const faq = await this.repo.findOne({ where: { id, estado: constants_1.Status.ACTIVE } });
        if (!faq)
            throw new common_1.NotFoundException('Pregunta frecuente no encontrada');
        return faq;
    }
    async crear(dto, usuarioCreacion) {
        const faq = this.repo.create({
            ...dto,
            activo: true,
            orden: dto.orden ?? 0,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.repo.save(faq);
    }
    async actualizar(id, dto, usuarioModificacion) {
        const faq = await this.obtener(id);
        Object.assign(faq, { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.repo.save(faq);
    }
    async eliminar(id, usuarioModificacion) {
        const faq = await this.obtener(id);
        faq.estado = constants_1.Status.ELIMINATE;
        faq.transaccion = constants_1.Transacccion.ELIMINAR;
        faq.usuarioModificacion = usuarioModificacion;
        await this.repo.save(faq);
    }
    async construirContexto(agenteId) {
        const todas = await this.listarPorAgente(agenteId);
        const activas = todas.filter(f => f.activo);
        if (!activas.length)
            return '';
        const lineas = ['=== PREGUNTAS FRECUENTES ==='];
        const grupos = new Map();
        const sinCategoria = [];
        for (const faq of activas) {
            if (faq.categoria) {
                if (!grupos.has(faq.categoria))
                    grupos.set(faq.categoria, []);
                grupos.get(faq.categoria).push(faq);
            }
            else {
                sinCategoria.push(faq);
            }
        }
        for (const [cat, items] of grupos) {
            lineas.push(`\n[${cat.toUpperCase()}]`);
            for (const faq of items) {
                lineas.push(`P: ${faq.pregunta}`);
                lineas.push(`R: ${faq.respuesta}`);
            }
        }
        if (sinCategoria.length) {
            if (grupos.size > 0)
                lineas.push('\n[GENERAL]');
            for (const faq of sinCategoria) {
                lineas.push(`P: ${faq.pregunta}`);
                lineas.push(`R: ${faq.respuesta}`);
            }
        }
        lineas.push('=== FIN PREGUNTAS FRECUENTES ===');
        return lineas.join('\n');
    }
};
BaseConocimientoService = BaseConocimientoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(base_conocimiento_entity_1.BaseConocimiento)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BaseConocimientoService);
exports.BaseConocimientoService = BaseConocimientoService;
//# sourceMappingURL=base-conocimiento.service.js.map