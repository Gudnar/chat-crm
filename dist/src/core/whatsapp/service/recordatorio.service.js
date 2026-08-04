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
var RecordatorioService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordatorioService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const agente_service_1 = require("../../agente/service/agente.service");
const conversacion_service_1 = require("../../conversacion/service/conversacion.service");
const whatsapp_service_1 = require("./whatsapp.service");
const MENSAJE_RECORDATORIO_DEFAULT = 'Hola 👋 Quería recordarle que nos falta su foto y ubicación para poder coordinar. Si tiene alguna duda, con gusto lo ayudo. 🙌';
let RecordatorioService = RecordatorioService_1 = class RecordatorioService {
    constructor(agenteService, conversacionService, waService) {
        this.agenteService = agenteService;
        this.conversacionService = conversacionService;
        this.waService = waService;
        this.logger = new common_1.Logger(RecordatorioService_1.name);
    }
    async cronRecordatorios() {
        try {
            const agentes = await this.agenteService.listarConRecordatorioActivo();
            for (const agente of agentes) {
                await this.procesarAgente(agente).catch(e => this.logger.warn(`[Recordatorio] Cron agente ${agente.id}: ${e.message}`));
            }
        }
        catch (e) {
            this.logger.error(`[Recordatorio] Cron error: ${e.message}`);
        }
    }
    async procesarAgente(agente) {
        const horas = agente.recordatorioHoras || 3;
        const pendientes = await this.conversacionService.listarPendientesParaRecordatorio(agente.id, horas);
        if (!pendientes.length)
            return;
        const config = await this.waService.obtenerConfig(agente.clienteId);
        if (!config.enabled || !config.accessToken)
            return;
        const mensaje = agente.recordatorioMensaje?.trim() || MENSAJE_RECORDATORIO_DEFAULT;
        for (const conv of pendientes) {
            await this.waService.enviarTexto(conv.contacto, mensaje, config);
            await this.conversacionService.agregarMensaje(conv.id, { role: 'assistant', content: mensaje });
            await this.conversacionService.marcarRecordatorioEnviado(conv.id);
            this.logger.log(`[Recordatorio] Enviado a ${conv.contacto} (conversación ${conv.id}, agente ${agente.id})`);
        }
    }
};
__decorate([
    (0, schedule_1.Cron)('*/15 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecordatorioService.prototype, "cronRecordatorios", null);
RecordatorioService = RecordatorioService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [agente_service_1.AgenteService,
        conversacion_service_1.ConversacionService,
        whatsapp_service_1.WhatsappService])
], RecordatorioService);
exports.RecordatorioService = RecordatorioService;
//# sourceMappingURL=recordatorio.service.js.map