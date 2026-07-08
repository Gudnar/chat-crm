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
var ToolExecutorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolExecutorService = void 0;
const common_1 = require("@nestjs/common");
const conversacion_service_1 = require("../../conversacion/service/conversacion.service");
const producto_service_1 = require("../../producto/service/producto.service");
let ToolExecutorService = ToolExecutorService_1 = class ToolExecutorService {
    constructor(conversacionService, productoService) {
        this.conversacionService = conversacionService;
        this.productoService = productoService;
        this.logger = new common_1.Logger(ToolExecutorService_1.name);
    }
    async ejecutar(nombre, input, contexto) {
        this.logger.log(`[Tool] ${nombre} → ${JSON.stringify(input)}`);
        try {
            switch (nombre) {
                case 'calificar_lead': return await this.calificarLead(input, contexto);
                case 'cambiar_estado': return await this.cambiarEstado(input, contexto);
                case 'escalar_agente': return await this.escalarAgente(input, contexto);
                case 'crear_nota': return await this.crearNota(input, contexto);
                case 'buscar_producto': return await this.buscarProducto(input, contexto);
                default:
                    this.logger.warn(`[Tool] Herramienta desconocida: ${nombre}`);
                    return { texto: `Herramienta "${nombre}" no está implementada.` };
            }
        }
        catch (err) {
            this.logger.error(`[Tool] Error ejecutando ${nombre}: ${err.message}`);
            return { texto: `Error al ejecutar la herramienta: ${err.message}` };
        }
    }
    async calificarLead(input, ctx) {
        const score = Math.min(100, Math.max(0, Number(input.score) || 0));
        await this.conversacionService.actualizarScore(ctx.conversacionId, score);
        return { texto: `Lead calificado con score ${score}. Razón: ${input.razon ?? 'sin especificar'}` };
    }
    async cambiarEstado(input, ctx) {
        await this.conversacionService.actualizarEstado(ctx.conversacionId, input.estado);
        return { texto: `Estado de conversación actualizado a: ${input.estado}` };
    }
    async escalarAgente(input, ctx) {
        await this.conversacionService.escalar(ctx.conversacionId, input.razon);
        return { texto: `Conversación escalada a agente humano. Razón: ${input.razon}. Prioridad: ${input.prioridad ?? 'media'}` };
    }
    async crearNota(input, ctx) {
        await this.conversacionService.agregarNota(ctx.conversacionId, input.nota);
        return { texto: `Nota interna creada: ${input.nota}` };
    }
    async buscarProducto(input, ctx) {
        const productos = await this.productoService.buscar(ctx.clienteId, input.termino, input.categoria);
        let texto = this.productoService.formatearParaClaude(productos);
        const imagenes = productos
            .flatMap(p => this.productoService.resolverUrlsImagenes(p.imagenes || []))
            .slice(0, 3);
        if (productos.length > 0) {
            texto += imagenes.length
                ? `\n\n[Sistema: se adjuntaron ${imagenes.length} imagen(es) del producto al chat del cliente]`
                : '\n\n[Sistema: estos productos NO tienen imágenes cargadas — no se envió ninguna foto al cliente]';
        }
        return { texto, imagenes };
    }
};
ToolExecutorService = ToolExecutorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [conversacion_service_1.ConversacionService,
        producto_service_1.ProductoService])
], ToolExecutorService);
exports.ToolExecutorService = ToolExecutorService;
//# sourceMappingURL=tool-executor.service.js.map