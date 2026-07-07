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
    async listar(clienteId, q, categoria, pagina = 1, limite = 25, soloActivos = false) {
        const qb = this.repo.createQueryBuilder('p')
            .where('p.clienteId = :clienteId', { clienteId })
            .andWhere('p.estado = :estado', { estado: constants_1.Status.ACTIVE });
        if (soloActivos)
            qb.andWhere('p.activo = true');
        if (q) {
            qb.andWhere('(p.nombre ILIKE :q OR p.marca ILIKE :q OR p.modelo ILIKE :q OR p.descripcion ILIKE :q OR p.categoria ILIKE :q)', { q: `%${q}%` });
        }
        if (categoria)
            qb.andWhere('LOWER(p.categoria) = LOWER(:categoria)', { categoria });
        const total = await qb.getCount();
        const totalPaginas = Math.max(1, Math.ceil(total / limite));
        const paginaSegura = Math.min(Math.max(1, pagina), totalPaginas);
        const items = await qb.clone()
            .orderBy('p.nombre', 'ASC')
            .skip((paginaSegura - 1) * limite)
            .take(limite)
            .getMany();
        const activos = await qb.clone().andWhere('p.activo = true').getCount();
        const catRows = await this.repo.createQueryBuilder('p')
            .select('DISTINCT p.categoria', 'categoria')
            .where('p.clienteId = :clienteId AND p.estado = :estado AND p.categoria IS NOT NULL', {
            clienteId, estado: constants_1.Status.ACTIVE,
        })
            .orderBy('categoria', 'ASC')
            .getRawMany();
        const categorias = catRows.map(r => r.categoria).filter(Boolean);
        return { items, total, activos, pagina: paginaSegura, totalPaginas, limite, categorias };
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
        const { items } = await this.listar(clienteId, termino, categoria, 1, 10, true);
        return items;
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
    valorCelda(celda) {
        const v = celda?.value;
        if (v == null)
            return '';
        if (typeof v === 'object') {
            if (v.richText)
                return v.richText.map((r) => r.text).join('').trim();
            if (v.text != null)
                return String(v.text).trim();
            if (v.result != null)
                return String(v.result).trim();
            if (v instanceof Date)
                return v.toISOString();
            return String(v).trim();
        }
        return String(v).trim();
    }
    parsearPrecio(valor) {
        if (valor == null || valor === '')
            return NaN;
        if (typeof valor === 'number')
            return valor;
        if (typeof valor === 'object') {
            if (typeof valor.result === 'number')
                return valor.result;
            const texto = valor.text ?? valor.result ?? (valor.richText ? valor.richText.map((r) => r.text).join('') : '');
            return this.parsearPrecio(String(texto));
        }
        let s = String(valor).replace(/[^\d.,-]/g, '').trim();
        if (!s)
            return NaN;
        if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) {
            s = s.replace(/\./g, '').replace(',', '.');
        }
        else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) {
            s = s.replace(/,/g, '');
        }
        else {
            s = s.replace(',', '.');
        }
        return parseFloat(s);
    }
    normalizarHeader(texto) {
        return texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
    async importarExcel(buffer, clienteId, usuarioCreacion) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.getWorksheet(1);
        let creados = 0;
        let actualizados = 0;
        const errores = [];
        if (!worksheet) {
            return { creados, actualizados, errores: ['El archivo no contiene hojas de cálculo.'] };
        }
        let filaHeaders = 0;
        const mapa = {};
        const headerOriginal = {};
        for (let r = 1; r <= Math.min(worksheet.rowCount, 10); r++) {
            const row = worksheet.getRow(r);
            const headers = {};
            const originales = {};
            row.eachCell((cell, col) => {
                const original = this.valorCelda(cell);
                const h = this.normalizarHeader(original);
                if (h) {
                    headers[h] = col;
                    originales[col] = original;
                }
            });
            const keys = Object.keys(headers);
            const esFilaHeader = (keys.includes('marca') && keys.includes('modelo')) ||
                (keys.includes('nombre') && keys.includes('precio'));
            if (esFilaHeader) {
                filaHeaders = r;
                Object.assign(mapa, headers);
                Object.assign(headerOriginal, originales);
                break;
            }
        }
        if (!filaHeaders) {
            return {
                creados,
                actualizados,
                errores: ['No se encontró la fila de encabezados. El archivo debe incluir las columnas "Marca" y "Modelo" (o "Nombre" y "Precio").'],
            };
        }
        const col = (...nombres) => {
            for (const n of nombres) {
                if (mapa[n] !== undefined)
                    return mapa[n];
                const parcial = Object.keys(mapa).find(k => k.includes(n));
                if (parcial)
                    return mapa[parcial];
            }
            return undefined;
        };
        const cols = {
            nombre: col('nombre'),
            categoria: col('categoria', 'catego'),
            marca: col('marca'),
            modelo: col('modelo'),
            version: col('version'),
            descripcion: col('descripcion'),
            potencia: col('potencia'),
            asientos: col('asientos', 'asien'),
            transmision: col('transmision'),
            traccion: col('traccion', 'tracc'),
            carroceria: col('carroceria', 'carro'),
            autonomia: col('autonomia'),
            bateria: col('bateria'),
            pantalla: col('pantalla'),
            precioUsd: col('en mano', 'precio usd', 'precio $'),
            precioBs: col('precio bs', 'bs'),
            precio: col('precio'),
            precioOferta: col('precio oferta', 'oferta'),
            moneda: col('moneda'),
            stock: col('stock'),
            activo: col('activo'),
        };
        const esFormatoVehiculos = cols.marca !== undefined && cols.modelo !== undefined && cols.nombre === undefined;
        const filas = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber <= filaHeaders)
                return;
            try {
                const celda = (c) => (c !== undefined ? this.valorCelda(row.getCell(c)) : '');
                if (esFormatoVehiculos) {
                    const marca = celda(cols.marca);
                    const modelo = celda(cols.modelo);
                    if (!marca && !modelo)
                        return;
                    const version = celda(cols.version);
                    const precioUsd = this.parsearPrecio(cols.precioUsd !== undefined ? row.getCell(cols.precioUsd).value : celda(cols.precio));
                    if (!marca || !modelo || isNaN(precioUsd)) {
                        errores.push(`Fila ${rowNumber}: Marca, Modelo y precio "en Mano" son obligatorios`);
                        return;
                    }
                    const precioBs = cols.precioBs !== undefined
                        ? this.parsearPrecio(row.getCell(cols.precioBs).value)
                        : NaN;
                    const specs = [
                        'potencia', 'asientos', 'transmision', 'traccion',
                        'carroceria', 'autonomia', 'bateria', 'pantalla',
                    ];
                    const partesDescripcion = [];
                    for (const c of specs) {
                        const colIdx = cols[c];
                        const val = celda(colIdx);
                        if (val && colIdx !== undefined) {
                            const etiqueta = headerOriginal[colIdx] || String(c);
                            partesDescripcion.push(`${etiqueta}: ${val}`);
                        }
                    }
                    const descripcion = partesDescripcion.length ? partesDescripcion.join(', ') : null;
                    const detalles = {};
                    if (version)
                        detalles.version = version;
                    if (!isNaN(precioBs))
                        detalles.precioBs = precioBs;
                    filas.push({
                        rowNumber,
                        datos: {
                            nombre: [marca, modelo, version].filter(Boolean).join(' '),
                            marca,
                            modelo,
                            categoria: celda(cols.categoria) || null,
                            descripcion,
                            precio: precioUsd,
                            precioOferta: null,
                            moneda: 'USD',
                            stock: null,
                            activo: true,
                            detalles,
                        },
                    });
                }
                else {
                    const nombre = celda(cols.nombre);
                    const precio = this.parsearPrecio(cols.precio !== undefined ? row.getCell(cols.precio).value : '');
                    if (!nombre && isNaN(precio))
                        return;
                    if (!nombre || isNaN(precio)) {
                        errores.push(`Fila ${rowNumber}: Nombre y Precio son obligatorios`);
                        return;
                    }
                    const precioOferta = this.parsearPrecio(cols.precioOferta !== undefined ? row.getCell(cols.precioOferta).value : '');
                    const stockVal = parseInt(celda(cols.stock), 10);
                    filas.push({
                        rowNumber,
                        datos: {
                            nombre,
                            marca: celda(cols.marca) || null,
                            modelo: celda(cols.modelo) || null,
                            categoria: celda(cols.categoria) || null,
                            descripcion: celda(cols.descripcion) || null,
                            precio,
                            precioOferta: isNaN(precioOferta) ? null : precioOferta,
                            moneda: celda(cols.moneda) || 'PEN',
                            stock: isNaN(stockVal) ? null : stockVal,
                            activo: (celda(cols.activo) || 'sí').toLowerCase() !== 'no',
                            detalles: {},
                        },
                    });
                }
            }
            catch (err) {
                errores.push(`Fila ${rowNumber}: ${err.message}`);
            }
        });
        for (const { rowNumber, datos } of filas) {
            try {
                const existente = await this.repo.findOne({
                    where: { clienteId, nombre: datos.nombre, estado: constants_1.Status.ACTIVE },
                });
                if (existente) {
                    Object.assign(existente, {
                        ...datos,
                        detalles: { ...(existente.detalles || {}), ...datos.detalles },
                        transaccion: constants_1.Transacccion.ACTUALIZAR,
                        usuarioModificacion: usuarioCreacion,
                    });
                    await this.repo.save(existente);
                    actualizados++;
                }
                else {
                    await this.repo.save(this.repo.create({
                        ...datos,
                        clienteId,
                        imagenes: [],
                        estado: constants_1.Status.ACTIVE,
                        transaccion: constants_1.Transacccion.CREAR,
                        usuarioCreacion,
                    }));
                    creados++;
                }
            }
            catch (err) {
                errores.push(`Fila ${rowNumber}: ${err.message}`);
            }
        }
        this.logger.log(`Import Excel: ${creados} creados, ${actualizados} actualizados, ${errores.length} errores`);
        return { creados, actualizados, errores };
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