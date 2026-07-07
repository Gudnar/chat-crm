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
var ProductoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fs_1 = require("fs");
const path_1 = require("path");
const config_1 = require("@nestjs/config");
const ExcelJS = __importStar(require("exceljs"));
const producto_entity_1 = require("../entity/producto.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
let ProductoService = ProductoService_1 = class ProductoService extends base_service_1.BaseService {
    constructor(repo, configService) {
        super(ProductoService_1.name);
        this.repo = repo;
        this.configService = configService;
    }
    construirUrlImagen(filename) {
        const appUrl = (this.configService.get('APP_URL') || 'http://localhost:3001').replace(/\/$/, '');
        return `${appUrl}/uploads/${filename}`;
    }
    resolverUrlsImagenes(filenames) {
        return (filenames || []).map(f => this.construirUrlImagen(f));
    }
    async listar(clienteId, q, categoria) {
        const base = { clienteId, estado: constants_1.Status.ACTIVE, activo: true };
        const where = q
            ? [
                { ...base, nombre: (0, typeorm_2.ILike)(`%${q}%`) },
                { ...base, marca: (0, typeorm_2.ILike)(`%${q}%`) },
                { ...base, modelo: (0, typeorm_2.ILike)(`%${q}%`) },
                { ...base, descripcion: (0, typeorm_2.ILike)(`%${q}%`) },
                { ...base, categoria: (0, typeorm_2.ILike)(`%${q}%`) },
            ]
            : [base];
        const items = await this.repo.find({ where, order: { nombre: 'ASC' }, take: 50 });
        return categoria
            ? items.filter(p => p.categoria?.toLowerCase() === categoria.toLowerCase())
            : items;
    }
    async obtener(id, clienteId) {
        const p = await this.repo.findOne({ where: { id, clienteId, estado: constants_1.Status.ACTIVE } });
        if (!p)
            throw new common_1.NotFoundException('Producto no encontrado');
        return p;
    }
    async crear(dto, clienteId, usuarioCreacion) {
        const producto = this.repo.create({
            ...dto,
            clienteId,
            moneda: dto.moneda || 'PEN',
            imagenes: [],
            detalles: dto.detalles || {},
            activo: true,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.repo.save(producto);
    }
    async actualizar(id, dto, clienteId, usuarioModificacion) {
        const p = await this.obtener(id, clienteId);
        const { imagenes: _, ...rest } = dto;
        Object.assign(p, { ...rest, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.repo.save(p);
    }
    async eliminar(id, clienteId, usuarioModificacion) {
        const p = await this.obtener(id, clienteId);
        for (const filename of p.imagenes || []) {
            this.borrarArchivo(filename);
        }
        p.estado = constants_1.Status.ELIMINATE;
        p.transaccion = constants_1.Transacccion.ELIMINAR;
        p.usuarioModificacion = usuarioModificacion;
        await this.repo.save(p);
    }
    async agregarImagenes(id, filenames, clienteId, usuarioModificacion) {
        const p = await this.obtener(id, clienteId);
        p.imagenes = [...(p.imagenes || []), ...filenames];
        p.transaccion = constants_1.Transacccion.ACTUALIZAR;
        p.usuarioModificacion = usuarioModificacion;
        return this.repo.save(p);
    }
    async eliminarImagen(id, filename, clienteId, usuarioModificacion) {
        const p = await this.obtener(id, clienteId);
        this.borrarArchivo(filename);
        p.imagenes = (p.imagenes || []).filter(img => img !== filename);
        p.transaccion = constants_1.Transacccion.ACTUALIZAR;
        p.usuarioModificacion = usuarioModificacion;
        return this.repo.save(p);
    }
    borrarArchivo(filename) {
        try {
            const filePath = (0, path_1.join)(process.cwd(), 'uploads', filename);
            if ((0, fs_1.existsSync)(filePath))
                (0, fs_1.unlinkSync)(filePath);
        }
        catch (err) {
            this.logger.warn(`No se pudo eliminar el archivo ${filename}: ${err.message}`);
        }
    }
    async buscar(clienteId, termino, categoria) {
        return this.listar(clienteId, termino, categoria);
    }
    formatearParaClaude(productos) {
        if (!productos.length) {
            return 'No encontré productos para ese término de búsqueda en el catálogo.';
        }
        return productos.map(p => {
            const precio = p.precioOferta
                ? `${p.moneda} ${Number(p.precioOferta).toFixed(2)} (oferta, antes ${p.moneda} ${Number(p.precio).toFixed(2)})`
                : `${p.moneda} ${Number(p.precio).toFixed(2)}`;
            const lineas = [`• *${p.nombre}*`];
            if (p.marca)
                lineas.push(`  Marca: ${p.marca}`);
            if (p.modelo)
                lineas.push(`  Modelo: ${p.modelo}`);
            if (p.categoria)
                lineas.push(`  Categoría: ${p.categoria}`);
            lineas.push(`  Precio: ${precio}`);
            if (p.stock != null)
                lineas.push(`  Disponibilidad: ${p.stock > 0 ? `${p.stock} en stock` : 'Sin stock'}`);
            if (p.descripcion)
                lineas.push(`  ${p.descripcion}`);
            if (Object.keys(p.detalles || {}).length) {
                const extras = Object.entries(p.detalles).map(([k, v]) => `${k}: ${v}`).join(', ');
                lineas.push(`  Detalles: ${extras}`);
            }
            return lineas.join('\n');
        }).join('\n\n');
    }
    async exportarExcel(clienteId) {
        const productos = await this.repo.find({
            where: { clienteId, estado: constants_1.Status.ACTIVE },
            order: { nombre: 'ASC' },
        });
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Productos');
        worksheet.columns = [
            { header: 'Nombre', key: 'nombre', width: 30 },
            { header: 'Marca', key: 'marca', width: 15 },
            { header: 'Modelo', key: 'modelo', width: 15 },
            { header: 'Categoría', key: 'categoria', width: 15 },
            { header: 'Descripción', key: 'descripcion', width: 40 },
            { header: 'Precio', key: 'precio', width: 12 },
            { header: 'Precio Oferta', key: 'precioOferta', width: 15 },
            { header: 'Moneda', key: 'moneda', width: 10 },
            { header: 'Stock', key: 'stock', width: 10 },
            { header: 'Activo', key: 'activo', width: 10 },
        ];
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        productos.forEach(p => {
            worksheet.addRow({
                nombre: p.nombre,
                marca: p.marca || '',
                modelo: p.modelo || '',
                categoria: p.categoria || '',
                descripcion: p.descripcion || '',
                precio: p.precio,
                precioOferta: p.precioOferta || '',
                moneda: p.moneda || 'PEN',
                stock: p.stock ?? '',
                activo: p.activo ? 'Sí' : 'No',
            });
        });
        return await workbook.xlsx.writeBuffer();
    }
    async importarExcel(buffer, clienteId, usuarioCreacion) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.getWorksheet(1);
        let creados = 0;
        const errores = [];
        const productosACrear = [];
        worksheet?.eachRow((row, rowNumber) => {
            if (rowNumber === 1)
                return;
            try {
                const values = row.values;
                const nombre = values[1];
                const marca = values[2];
                const modelo = values[3];
                const categoria = values[4];
                const descripcion = values[5];
                const precio = parseFloat(values[6]);
                const precioOferta = values[7] ? parseFloat(values[7]) : null;
                const moneda = values[8] || 'PEN';
                const stock = values[9] ? parseInt(values[9], 10) : null;
                const activo = (values[10] || 'Sí').toLowerCase() === 'sí';
                if (!nombre || isNaN(precio)) {
                    errores.push(`Fila ${rowNumber}: Nombre y Precio son obligatorios`);
                    return;
                }
                productosACrear.push({
                    nombre,
                    marca: marca || null,
                    modelo: modelo || null,
                    categoria: categoria || null,
                    descripcion: descripcion || null,
                    precio,
                    precioOferta: precioOferta || null,
                    moneda,
                    stock: stock || null,
                    activo,
                    clienteId,
                    imagenes: [],
                    detalles: {},
                    estado: constants_1.Status.ACTIVE,
                    transaccion: constants_1.Transacccion.CREAR,
                    usuarioCreacion,
                });
            }
            catch (err) {
                errores.push(`Fila ${rowNumber}: ${err.message}`);
            }
        });
        if (productosACrear.length > 0) {
            try {
                await this.repo.insert(productosACrear);
                creados = productosACrear.length;
            }
            catch (err) {
                errores.push(`Error al insertar productos: ${err.message}`);
            }
        }
        return { creados, errores };
    }
};
ProductoService = ProductoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], ProductoService);
exports.ProductoService = ProductoService;
//# sourceMappingURL=producto.service.js.map