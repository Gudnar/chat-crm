"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const horario_agente_service_1 = require("./src/core/reservacion/service/horario-agente.service");
const agente_service_1 = require("./src/core/agente/service/agente.service");
const conversacion_service_1 = require("./src/core/conversacion/service/conversacion.service");
const whatsapp_webhook_service_1 = require("./src/core/whatsapp/service/whatsapp-webhook.service");
const reservacion_service_1 = require("./src/core/reservacion/service/reservacion.service");
const tool_executor_service_1 = require("./src/core/herramienta/service/tool-executor.service");
const USUARIO_SISTEMA = '1';
const CLIENTE_ID = '4';
const AGENTE_IA_ID = '13';
const CARLOS_ID = '14';
const MARIA_ID = '15';
async function main() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, { logger: ['error', 'warn'] });
    const horarioService = app.get(horario_agente_service_1.HorarioAgenteService);
    const agenteService = app.get(agente_service_1.AgenteService);
    const conversacionService = app.get(conversacion_service_1.ConversacionService);
    const webhookService = app.get(whatsapp_webhook_service_1.WhatsappWebhookService);
    const reservacionService = app.get(reservacion_service_1.ReservacionService);
    const toolExecutor = app.get(tool_executor_service_1.ToolExecutorService);
    console.log('0) Configurando horarios lunes 08:00-12:00 para Carlos y María...');
    for (const agenteId of [CARLOS_ID, MARIA_ID]) {
        await horarioService.crear({ agenteId, diaSemana: 1, horaInicio: '08:00', horaFin: '12:00' }, USUARIO_SISTEMA, CLIENTE_ID);
    }
    const conv = await conversacionService.crear({ agenteId: AGENTE_IA_ID, contacto: '59179996666-nombretest', canal: 'whatsapp', etiquetas: [] }, USUARIO_SISTEMA, CLIENTE_ID);
    console.log('\n=== PRUEBA A: pedir un nombre que NO existe (no debe pedir ID) ===');
    let r = await toolExecutor.ejecutar('agendar_cita', { fecha_hora: '2026-08-03 09:00', titulo: 'Masaje', agente: 'José' }, { conversacionId: conv.id, clienteId: CLIENTE_ID, agenteId: AGENTE_IA_ID });
    console.log(r.texto);
    console.log(r.texto.toLowerCase().includes('id') ? '❌ FALLO: todavía menciona "ID"' : '✅ OK: no pide ID');
    console.log('\n=== PRUEBA B: pedir por nombre real ("María") — debe agendar directo ===');
    r = await toolExecutor.ejecutar('agendar_cita', { fecha_hora: '2026-08-03 09:00', titulo: 'Masaje', agente: 'María' }, { conversacionId: conv.id, clienteId: CLIENTE_ID, agenteId: AGENTE_IA_ID });
    console.log(r.texto);
    console.log('\n=== PRUEBA C: consultar disponibilidad de TODO el equipo (sin nombre) ===');
    const conv2 = await conversacionService.crear({ agenteId: AGENTE_IA_ID, contacto: '59179996667-nombretest', canal: 'whatsapp', etiquetas: [] }, USUARIO_SISTEMA, CLIENTE_ID);
    r = await toolExecutor.ejecutar('consultar_disponibilidad', { fecha: '2026-08-03' }, { conversacionId: conv2.id, clienteId: CLIENTE_ID, agenteId: AGENTE_IA_ID });
    console.log(r.texto);
    console.log('\n=== PRUEBA D: agendar SIN nombre, con María ya ocupada a las 9 — debe auto-elegir a Carlos ===');
    r = await toolExecutor.ejecutar('agendar_cita', { fecha_hora: '2026-08-03 09:00', titulo: 'Corte de cabello' }, { conversacionId: conv2.id, clienteId: CLIENTE_ID, agenteId: AGENTE_IA_ID });
    console.log(r.texto);
    console.log(r.texto.includes('Carlos') ? '✅ OK: auto-asignó a Carlos (María ya estaba ocupada)' : '⚠️ revisar a quién asignó');
    const reservas = await reservacionService.listar(CLIENTE_ID, {});
    for (const res of reservas.filter(x => x.conversacionId === conv.id || x.conversacionId === conv2.id)) {
        await reservacionService.actualizarEstado(res.id, { estado: 'cancelada' }, USUARIO_SISTEMA, CLIENTE_ID);
    }
    console.log('\n✅ Pruebas completadas.');
    await app.close();
    process.exit(0);
}
main().catch(err => { console.error('❌ ERROR:', err); process.exit(1); });
//# sourceMappingURL=smoke-nombre-agente.js.map