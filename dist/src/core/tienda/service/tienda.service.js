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
var TiendaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiendaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fs_1 = require("fs");
const path_1 = require("path");
const articulo_tienda_entity_1 = require("../entity/articulo-tienda.entity");
const categoria_tienda_entity_1 = require("../entity/categoria-tienda.entity");
const articulo_sucursal_entity_1 = require("../entity/articulo-sucursal.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
const imagen_util_1 = require("../../../common/lib/imagen.util");
const url_assets_util_1 = require("../../../common/lib/url-assets.util");
let TiendaService = TiendaService_1 = class TiendaService extends base_service_1.BaseService {
    constructor(repo, categoriaRepo, articuloSucursalRepo) {
        super(TiendaService_1.name);
        this.repo = repo;
        this.categoriaRepo = categoriaRepo;
        this.articuloSucursalRepo = articuloSucursalRepo;
    }
    construirUrlImagen(filename) {
        return `${(0, url_assets_util_1.baseUrlAssets)()}/uploads/${filename}`;
    }
    async guardarImagenProcesada(buffer, preset) {
        const procesada = await (0, imagen_util_1.redimensionarImagen)(buffer, preset);
        const dir = (0, path_1.join)(process.cwd(), 'uploads', 'tienda');
        if (!(0, fs_1.existsSync)(dir))
            (0, fs_1.mkdirSync)(dir, { recursive: true });
        const filename = `tienda/${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
        (0, fs_1.writeFileSync)((0, path_1.join)(process.cwd(), 'uploads', filename), procesada);
        return this.construirUrlImagen(filename);
    }
    async listar(clienteId) {
        return this.repo.find({
            where: { clienteId, estado: constants_1.Status.ACTIVE },
            order: { orden: 'ASC', fechaCreacion: 'DESC' },
        });
    }
    async obtener(id, clienteId) {
        const articulo = await this.repo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!articulo)
            throw new common_1.NotFoundException('Artículo no encontrado');
        return articulo;
    }
    async crear(dto, clienteId, usuarioCreacion) {
        const articulo = this.repo.create({
            ...dto,
            clienteId,
            moneda: dto.moneda || 'Bs',
            gruposOpciones: dto.gruposOpciones ?? [],
            activo: true,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.repo.save(articulo);
    }
    async actualizar(id, dto, clienteId, usuarioModificacion) {
        const articulo = await this.obtener(id, clienteId);
        Object.assign(articulo, { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.repo.save(articulo);
    }
    async eliminar(id, clienteId, usuarioModificacion) {
        const articulo = await this.obtener(id, clienteId);
        articulo.estado = constants_1.Status.ELIMINATE;
        articulo.transaccion = constants_1.Transacccion.ELIMINAR;
        articulo.usuarioModificacion = usuarioModificacion;
        await this.repo.save(articulo);
    }
    async setImagen(id, url, clienteId, usuarioModificacion) {
        const articulo = await this.obtener(id, clienteId);
        articulo.imagenUrl = url;
        articulo.transaccion = constants_1.Transacccion.ACTUALIZAR;
        articulo.usuarioModificacion = usuarioModificacion;
        return this.repo.save(articulo);
    }
    async listarCategorias(clienteId) {
        return this.categoriaRepo.find({
            where: { clienteId, estado: constants_1.Status.ACTIVE },
            order: { orden: 'ASC', nombre: 'ASC' },
        });
    }
    async obtenerCategoria(id, clienteId) {
        const categoria = await this.categoriaRepo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!categoria)
            throw new common_1.NotFoundException('Categoría no encontrada');
        return categoria;
    }
    async crearCategoria(dto, clienteId, usuarioCreacion) {
        const categoria = this.categoriaRepo.create({
            ...dto,
            clienteId,
            activo: true,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.categoriaRepo.save(categoria);
    }
    async actualizarCategoria(id, dto, clienteId, usuarioModificacion) {
        const categoria = await this.obtenerCategoria(id, clienteId);
        Object.assign(categoria, { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.categoriaRepo.save(categoria);
    }
    async eliminarCategoria(id, clienteId, usuarioModificacion) {
        const categoria = await this.obtenerCategoria(id, clienteId);
        categoria.estado = constants_1.Status.ELIMINATE;
        categoria.transaccion = constants_1.Transacccion.ELIMINAR;
        categoria.usuarioModificacion = usuarioModificacion;
        await this.categoriaRepo.save(categoria);
    }
    async setImagenCategoria(id, url, clienteId, usuarioModificacion) {
        const categoria = await this.obtenerCategoria(id, clienteId);
        categoria.imagenUrl = url;
        categoria.transaccion = constants_1.Transacccion.ACTUALIZAR;
        categoria.usuarioModificacion = usuarioModificacion;
        return this.categoriaRepo.save(categoria);
    }
    async listarDisponibilidad(articuloId, clienteId) {
        await this.obtener(articuloId, clienteId);
        return this.articuloSucursalRepo.find({ where: { articuloId, estado: constants_1.Status.ACTIVE } });
    }
    async actualizarDisponibilidad(articuloId, filas, clienteId, usuarioId) {
        await this.obtener(articuloId, clienteId);
        const existentes = await this.articuloSucursalRepo.find({ where: { articuloId, estado: constants_1.Status.ACTIVE } });
        for (const fila of filas) {
            const existente = existentes.find(e => e.sucursalId === fila.sucursalId);
            if (existente) {
                Object.assign(existente, { activo: fila.activo, stock: fila.stock ?? null, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion: usuarioId });
                await this.articuloSucursalRepo.save(existente);
            }
            else {
                await this.articuloSucursalRepo.save(this.articuloSucursalRepo.create({
                    articuloId, sucursalId: fila.sucursalId, activo: fila.activo, stock: fila.stock ?? null,
                    estado: constants_1.Status.ACTIVE, transaccion: constants_1.Transacccion.CREAR, usuarioCreacion: usuarioId,
                }));
            }
        }
        return this.listarDisponibilidad(articuloId, clienteId);
    }
};
TiendaService = TiendaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(articulo_tienda_entity_1.ArticuloTienda)),
    __param(1, (0, typeorm_1.InjectRepository)(categoria_tienda_entity_1.CategoriaTienda)),
    __param(2, (0, typeorm_1.InjectRepository)(articulo_sucursal_entity_1.ArticuloSucursal)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TiendaService);
exports.TiendaService = TiendaService;
//# sourceMappingURL=tienda.service.js.map