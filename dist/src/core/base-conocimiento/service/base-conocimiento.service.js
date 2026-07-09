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
var BaseConocimientoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseConocimientoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ExcelJS = __importStar(require("exceljs"));
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
            return String(v).trim();
        }
        return String(v).trim();
    }
    normalizarHeader(texto) {
        return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
    }
    async exportarExcel(agenteId) {
        const faqs = await this.listarPorAgente(agenteId);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Base de Conocimiento');
        worksheet.columns = [
            { header: 'Pregunta', key: 'pregunta', width: 50 },
            { header: 'Respuesta', key: 'respuesta', width: 80 },
            { header: 'Categoría', key: 'categoria', width: 25 },
            { header: 'Activo', key: 'activo', width: 10 },
            { header: 'Orden', key: 'orden', width: 8 },
        ];
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        worksheet.getColumn('respuesta').alignment = { wrapText: true, vertical: 'top' };
        worksheet.getColumn('pregunta').alignment = { wrapText: true, vertical: 'top' };
        for (const f of faqs) {
            worksheet.addRow({
                pregunta: f.pregunta,
                respuesta: f.respuesta,
                categoria: f.categoria || '',
                activo: f.activo ? 'Sí' : 'No',
                orden: f.orden ?? 0,
            });
        }
        return await workbook.xlsx.writeBuffer();
    }
    async importarExcel(buffer, agenteId, usuarioCreacion) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.getWorksheet(1);
        let creadas = 0;
        let actualizadas = 0;
        const errores = [];
        if (!worksheet)
            return { creadas, actualizadas, errores: ['El archivo no contiene hojas de cálculo.'] };
        let filaHeaders = 0;
        const mapa = {};
        for (let r = 1; r <= Math.min(worksheet.rowCount, 10); r++) {
            const headers = {};
            worksheet.getRow(r).eachCell((cell, col) => {
                const h = this.normalizarHeader(this.valorCelda(cell));
                if (h)
                    headers[h] = col;
            });
            if (headers['pregunta'] !== undefined && headers['respuesta'] !== undefined) {
                filaHeaders = r;
                Object.assign(mapa, headers);
                break;
            }
        }
        if (!filaHeaders) {
            return { creadas, actualizadas, errores: ['No se encontró la fila de encabezados. El archivo debe tener las columnas "Pregunta" y "Respuesta".'] };
        }
        const col = (nombre) => mapa[nombre];
        const filas = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber <= filaHeaders)
                return;
            try {
                const celda = (c) => (c !== undefined ? this.valorCelda(row.getCell(c)) : '');
                const pregunta = celda(col('pregunta'));
                const respuesta = celda(col('respuesta'));
                if (!pregunta && !respuesta)
                    return;
                if (!pregunta || !respuesta) {
                    errores.push(`Fila ${rowNumber}: Pregunta y Respuesta son obligatorias`);
                    return;
                }
                const activoTxt = celda(col('activo')).toLowerCase();
                const ordenNum = parseInt(celda(col('orden')), 10);
                filas.push({
                    rowNumber,
                    datos: {
                        pregunta,
                        respuesta,
                        categoria: celda(col('categoria')) || null,
                        activo: respuesta.includes('[CONFIRMAR')
                            ? false
                            : (activoTxt ? activoTxt !== 'no' && activoTxt !== 'false' && activoTxt !== '0' : true),
                        orden: isNaN(ordenNum) ? 0 : ordenNum,
                    },
                });
            }
            catch (err) {
                errores.push(`Fila ${rowNumber}: ${err.message}`);
            }
        });
        for (const { rowNumber, datos } of filas) {
            try {
                const existente = await this.repo.findOne({
                    where: { agenteId, pregunta: datos.pregunta, estado: constants_1.Status.ACTIVE },
                });
                if (existente) {
                    Object.assign(existente, { ...datos, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion: usuarioCreacion });
                    await this.repo.save(existente);
                    actualizadas++;
                }
                else {
                    await this.repo.save(this.repo.create({
                        ...datos,
                        agenteId,
                        estado: constants_1.Status.ACTIVE,
                        transaccion: constants_1.Transacccion.CREAR,
                        usuarioCreacion,
                    }));
                    creadas++;
                }
            }
            catch (err) {
                errores.push(`Fila ${rowNumber}: ${err.message}`);
            }
        }
        this.logger.log(`Import FAQ agente ${agenteId}: ${creadas} creadas, ${actualizadas} actualizadas, ${errores.length} errores`);
        return { creadas, actualizadas, errores };
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