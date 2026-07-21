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
var RecursoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecursoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const fs_1 = require("fs");
const path_1 = require("path");
const recurso_entity_1 = require("../entity/recurso.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
const recurso_constants_1 = require("../recurso.constants");
let RecursoService = RecursoService_1 = class RecursoService extends base_service_1.BaseService {
    constructor(recursoRepository, configService) {
        super(RecursoService_1.name);
        this.recursoRepository = recursoRepository;
        this.configService = configService;
    }
    async listar(clienteId, filtros) {
        const where = { clienteId, estado: constants_1.Status.ACTIVE };
        if (filtros?.tipo)
            where.tipo = filtros.tipo;
        if (filtros?.categoria)
            where.categoria = filtros.categoria;
        if (filtros?.activo !== undefined)
            where.activo = filtros.activo;
        return this.recursoRepository.find({
            where,
            order: { fechaCreacion: 'DESC' },
        });
    }
    async obtener(id, clienteId) {
        const recurso = await this.recursoRepository.findOne({
            where: { id, clienteId, estado: constants_1.Status.ACTIVE },
        });
        if (!recurso)
            throw new common_1.NotFoundException('Recurso no encontrado');
        return recurso;
    }
    async crear(dto, file, usuarioCreacion, clienteId) {
        if (!file && !dto.urlExterna) {
            throw new common_1.BadRequestException('Debes proporcionar un archivo o URL externa');
        }
        const recurso = this.recursoRepository.create({
            ...dto,
            keywords: this.normalizarKeywords(dto.keywords),
            clienteId,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        if (file) {
            const tipo = (0, recurso_constants_1.detectarTipo)(file.mimetype);
            if (!tipo) {
                this.borrarArchivo(file.path);
                throw new common_1.BadRequestException(`Tipo de archivo no permitido: ${file.mimetype}`);
            }
            const limite = recurso_constants_1.LIMITE_BYTES_POR_TIPO[tipo];
            if (file.size > limite) {
                this.borrarArchivo(file.path);
                throw new common_1.BadRequestException(`El archivo pesa ${(0, recurso_constants_1.formatearBytes)(file.size)} y WhatsApp permite hasta ${(0, recurso_constants_1.formatearBytes)(limite)} para ${tipo}.`);
            }
            recurso.tipo = tipo;
            recurso.archivoLocal = `${tipo.toLowerCase()}/${file.filename}`;
            recurso.tamanobytes = file.size;
            recurso.mimeType = file.mimetype;
        }
        else if (!recurso.tipo) {
            throw new common_1.BadRequestException('Debes indicar el tipo del recurso cuando usas una URL externa');
        }
        return this.recursoRepository.save(recurso);
    }
    normalizarKeywords(keywords) {
        if (!keywords)
            return [];
        if (Array.isArray(keywords)) {
            return keywords.map(k => String(k).trim().toLowerCase()).filter(Boolean);
        }
        const texto = String(keywords).trim();
        if (!texto)
            return [];
        if (texto.startsWith('[')) {
            try {
                const parsed = JSON.parse(texto);
                if (Array.isArray(parsed))
                    return parsed.map(k => String(k).trim().toLowerCase()).filter(Boolean);
            }
            catch { }
        }
        return texto.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
    }
    borrarArchivo(ruta) {
        if (!ruta)
            return;
        try {
            if ((0, fs_1.existsSync)(ruta))
                (0, fs_1.unlinkSync)(ruta);
        }
        catch (err) {
            this.logger.warn(`No se pudo borrar el archivo ${ruta}: ${err.message}`);
        }
    }
    async actualizar(id, dto, usuarioModificacion, clienteId) {
        const recurso = await this.obtener(id, clienteId);
        Object.assign(recurso, {
            ...dto,
            ...(dto.keywords !== undefined ? { keywords: this.normalizarKeywords(dto.keywords) } : {}),
            transaccion: constants_1.Transacccion.ACTUALIZAR,
            usuarioModificacion,
        });
        return this.recursoRepository.save(recurso);
    }
    async eliminar(id, usuarioModificacion, clienteId) {
        const recurso = await this.obtener(id, clienteId);
        if (recurso.archivoLocal) {
            this.borrarArchivo((0, path_1.join)(process.cwd(), 'uploads', 'recursos', clienteId, recurso.archivoLocal));
        }
        recurso.estado = constants_1.Status.ELIMINATE;
        recurso.transaccion = constants_1.Transacccion.ELIMINAR;
        recurso.usuarioModificacion = usuarioModificacion;
        await this.recursoRepository.save(recurso);
    }
    async buscarPorKeywords(clienteId, keyword) {
        const normalizado = keyword.toLowerCase().trim();
        const recursos = await this.recursoRepository.find({
            where: { clienteId, activo: true, estado: constants_1.Status.ACTIVE },
        });
        return recursos.filter(r => r.nombre.toLowerCase().includes(normalizado) ||
            r.categoria?.toLowerCase().includes(normalizado) ||
            r.keywords.some(k => k.toLowerCase().includes(normalizado)));
    }
    async obtenerUrlPublica(recursoId, clienteId) {
        const recurso = await this.obtener(recursoId, clienteId);
        if (recurso.urlExterna) {
            return recurso.urlExterna;
        }
        if (recurso.archivoLocal) {
            const appUrl = (this.configService.get('APP_URL') || 'http://localhost:3001').replace(/\/$/, '');
            return `${appUrl}/uploads/recursos/${clienteId}/${recurso.archivoLocal}`;
        }
        throw new common_1.BadRequestException('Recurso no tiene URL');
    }
    obtenerTiposPermitidos() {
        return Object.values(recurso_entity_1.TipoRecurso);
    }
    obtenerMimeTypesPermitidos() {
        return recurso_constants_1.MIME_POR_TIPO;
    }
    obtenerLimites() {
        return Object.fromEntries(Object.entries(recurso_constants_1.LIMITE_BYTES_POR_TIPO).map(([tipo, bytes]) => [
            tipo,
            { bytes, legible: (0, recurso_constants_1.formatearBytes)(bytes) },
        ]));
    }
};
RecursoService = RecursoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(recurso_entity_1.Recurso)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], RecursoService);
exports.RecursoService = RecursoService;
//# sourceMappingURL=recurso.service.js.map