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
var RecordatorioCitaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordatorioCitaService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const agente_service_1 = require("../../agente/service/agente.service");
const reservacion_service_1 = require("../../reservacion/service/reservacion.service");
const conversacion_service_1 = require("../../conversacion/service/conversacion.service");
const plantilla_whatsapp_service_1 = require("./plantilla-whatsapp.service");
const whatsapp_service_1 = require("./whatsapp.service");
const constants_1 = require("../../../common/constants");
const ventana_24h_util_1 = require("../../../common/lib/ventana-24h.util");
const MENSAJE_RECORDATORIO_CITA_DEFAULT = 'Te recordamos tu llamada con nuestro asesor comercial. ¡Te esperamos! 📞';
let RecordatorioCitaService = RecordatorioCitaService_1 = class RecordatorioCitaService {
    constructor(agenteService, reservacionService, conversacionService, plantillaService, waService) {
        this.agenteService = agenteService;
        this.reservacionService = reservacionService;
        this.conversacionService = conversacionService;
        this.plantillaService = plantillaService;
        this.waService = waService;
        this.logger = new common_1.Logger(RecordatorioCitaService_1.name);
    }
    async cronRecordatoriosCita() {
        try {
            const agentes = await this.agenteService.listarConRecordatorioCitaActivo();
            for (const agente of agentes) {
                await this.procesarAgente(agente).catch(e => this.logger.warn(`[RecordatorioCita] Cron agente ${agente.id}: ${e.message}`));
            }
        }
        catch (e) {
            this.logger.error(`[RecordatorioCita] Cron error: ${e.message}`);
        }
    }
    async procesarAgente(agente) {
        const horas = agente.recordatorioCitaHoras || 2;
        const reservas = await this.reservacionService.listarPendientesParaRecordatorioCita(agente.id, horas);
        if (!reservas.length)
            return;
        const config = await this.waService.obtenerConfig(agente.clienteId);
        if (!config.enabled || !config.accessToken)
            return;
        const mensajeBase = agente.recordatorioCitaMensaje?.trim() || MENSAJE_RECORDATORIO_CITA_DEFAULT;
        for (const reserva of reservas) {
            await this.procesarReserva(reserva, agente, config, mensajeBase).catch(e => this.logger.warn(`[RecordatorioCita] Reserva ${reserva.id}: ${e.message}`));
        }
    }
    async procesarReserva(reserva, agente, config, mensajeBase) {
        if (!reserva.contactoTelefono) {
            this.logger.warn(`[RecordatorioCita] Reserva ${reserva.id} sin contactoTelefono — se omite`);
            await this.reservacionService.marcarRecordatorioCitaEnviado(reserva.id);
            return;
        }
        const hora = new Date(reserva.fechaInicio).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', timeZone: 'America/La_Paz' });
        const mensaje = `${mensajeBase} Hoy a las ${hora}.`;
        let mensajesConversacion = [];
        if (reserva.conversacionId) {
            try {
                const conv = await this.conversacionService.obtener(reserva.conversacionId);
                mensajesConversacion = conv.mensajes || [];
            }
            catch {
            }
        }
        const fueraDeVentana = !reserva.conversacionId || (0, ventana_24h_util_1.estaFueraDeVentana24h)(mensajesConversacion);
        if (!fueraDeVentana) {
            await this.waService.enviarTexto(reserva.contactoTelefono, mensaje, config);
        }
        else {
            const enviadaPorPlantilla = await this.enviarPorPlantilla(reserva, agente, config, hora);
            if (!enviadaPorPlantilla) {
                await this.reservacionService.marcarRecordatorioCitaEnviado(reserva.id);
                return;
            }
        }
        if (reserva.conversacionId) {
            await this.conversacionService.agregarMensaje(reserva.conversacionId, { role: 'assistant', content: mensaje }).catch(() => { });
        }
        await this.reservacionService.marcarRecordatorioCitaEnviado(reserva.id);
        this.logger.log(`[RecordatorioCita] Recordatorio enviado para reserva ${reserva.id} (${fueraDeVentana ? 'plantilla' : 'texto libre'})`);
    }
    async enviarPorPlantilla(reserva, agente, config, hora) {
        if (!agente.recordatorioCitaPlantillaId) {
            this.logger.warn(`[RecordatorioCita] Reserva ${reserva.id} fuera de ventana de 24h y sin plantilla configurada — se omite el envío`);
            return false;
        }
        const plantilla = await this.plantillaService.obtener(agente.recordatorioCitaPlantillaId, agente.clienteId).catch(() => null);
        if (!plantilla || plantilla.estadoPlantilla !== constants_1.EstadoPlantillaWhatsapp.APROBADA) {
            this.logger.warn(`[RecordatorioCita] Reserva ${reserva.id}: la plantilla configurada no está aprobada — se omite el envío`);
            return false;
        }
        const placeholders = (plantilla.componentes.body.texto.match(/\{\{\d+\}\}/g) || []).length;
        if (placeholders > 1) {
            this.logger.warn(`[RecordatorioCita] Reserva ${reserva.id}: la plantilla tiene más de una variable — no soportado, se omite el envío`);
            return false;
        }
        const componentesEnvio = placeholders === 1
            ? [{ type: 'body', parameters: [{ type: 'text', text: hora }] }]
            : [];
        await this.waService.enviarPlantilla(reserva.contactoTelefono, plantilla.nombre, plantilla.idioma, componentesEnvio, config);
        return true;
    }
};
__decorate([
    (0, schedule_1.Cron)('*/15 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecordatorioCitaService.prototype, "cronRecordatoriosCita", null);
RecordatorioCitaService = RecordatorioCitaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [agente_service_1.AgenteService,
        reservacion_service_1.ReservacionService,
        conversacion_service_1.ConversacionService,
        plantilla_whatsapp_service_1.PlantillaWhatsappService,
        whatsapp_service_1.WhatsappService])
], RecordatorioCitaService);
exports.RecordatorioCitaService = RecordatorioCitaService;
//# sourceMappingURL=recordatorio-cita.service.js.map