"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const agente_service_1 = require("./src/core/agente/service/agente.service");
const conversacion_service_1 = require("./src/core/conversacion/service/conversacion.service");
const whatsapp_webhook_service_1 = require("./src/core/whatsapp/service/whatsapp-webhook.service");
const reservacion_service_1 = require("./src/core/reservacion/service/reservacion.service");
const USUARIO_SISTEMA = '1';
const CLIENTE_ID = '4';
const AGENTE_IA_ID = '13';
async function main() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, { logger: ['error', 'warn'] });
    const agenteService = app.get(agente_service_1.AgenteService);
    const conversacionService = app.get(conversacion_service_1.ConversacionService);
    const webhookService = app.get(whatsapp_webhook_service_1.WhatsappWebhookService);
    const reservacionService = app.get(reservacion_service_1.ReservacionService);
    const agente = await agenteService.obtener(AGENTE_IA_ID, CLIENTE_ID);
    console.log(`Agente: ${agente.nombre}`);
    const conv = await conversacionService.crear({ agenteId: AGENTE_IA_ID, contacto: '59179995555-oasistest', canal: 'whatsapp', etiquetas: [] }, USUARIO_SISTEMA, CLIENTE_ID);
    const historial = [
        { role: 'user', content: 'hola' },
        { role: 'assistant', content: '¡Hola! 👋 Soy Oasis, tu asistente IA. ¿En qué puedo ayudarte hoy?' },
        { role: 'user', content: 'Agendar' },
        { role: 'assistant', content: '¡Perfecto! Para agendar una cita necesito algunos detalles: fecha y hora, asunto, duración. ¿Con quién te gustaría? 😊' },
        { role: 'user', content: 'Lunes a las 9 am masaje con maria' },
    ];
    for (const m of historial)
        await conversacionService.agregarMensaje(conv.id, m);
    console.log('\nCliente pide cita con "maria" (así, tal cual, sin tilde, en minúscula)...');
    let resultado = await webhookService.llamarClaude(agente, historial, CLIENTE_ID, conv.id);
    console.log('\nRespuesta real del agente:\n' + resultado.respuesta);
    let menciona_id = /\bID\b|número de identificaci|código de identificaci/i.test(resultado.respuesta || '');
    console.log('\n' + (menciona_id ? '❌ FALLO: el agente sigue pidiendo un ID' : '✅ ÉXITO: el agente NO pide ningún ID'));
    await conversacionService.agregarMensaje(conv.id, { role: 'assistant', content: resultado.respuesta });
    historial.push({ role: 'assistant', content: resultado.respuesta });
    historial.push({ role: 'user', content: '3 de agosto' });
    await conversacionService.agregarMensaje(conv.id, { role: 'user', content: '3 de agosto' });
    console.log('\n--- Cliente confirma fecha: "3 de agosto" ---');
    resultado = await webhookService.llamarClaude(agente, historial, CLIENTE_ID, conv.id);
    console.log('\nRespuesta real del agente:\n' + resultado.respuesta);
    menciona_id = /\bID\b|número de identificaci|código de identificaci/i.test(resultado.respuesta || '');
    console.log('\n' + (menciona_id ? '❌ FALLO: el agente pidió un ID' : '✅ OK: sigue sin pedir ID'));
    const reservas = await reservacionService.listar(CLIENTE_ID, {});
    const creada = reservas.find(r => r.conversacionId === conv.id);
    if (creada) {
        console.log(`✅ Reserva creada: ${creada.codigoReserva} con agente_id=${creada.agenteId}`);
        await reservacionService.actualizarEstado(creada.id, { estado: 'cancelada' }, USUARIO_SISTEMA, CLIENTE_ID);
    }
    else {
        console.log('⚠️ No se creó ninguna reserva en este intento (puede requerir un segundo mensaje de confirmación, normal en el flujo).');
    }
    await app.close();
    process.exit(0);
}
main().catch(err => { console.error('❌ ERROR:', err); process.exit(1); });
//# sourceMappingURL=smoke-oasis-real.js.map