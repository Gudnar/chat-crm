"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const tool_executor_service_1 = require("./src/core/herramienta/service/tool-executor.service");
const whatsapp_service_1 = require("./src/core/whatsapp/service/whatsapp.service");
const conversacion_service_1 = require("./src/core/conversacion/service/conversacion.service");
const whatsapp_webhook_service_1 = require("./src/core/whatsapp/service/whatsapp-webhook.service");
const CONTACTO = '59170000044';
const PHONE_NUMBER_ID = '1267995426390859';
const CLIENTE_ID = '4';
const conversacionesCreadas = [];
async function main() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, { logger: ['log', 'warn', 'error'] });
    const toolExecutor = app.get(tool_executor_service_1.ToolExecutorService);
    const waService = app.get(whatsapp_service_1.WhatsappService);
    const conversacionService = app.get(conversacion_service_1.ConversacionService);
    const webhookService = app.get(whatsapp_webhook_service_1.WhatsappWebhookService);
    const config = await waService.obtenerConfig(CLIENTE_ID);
    console.log('\n\n########## CASO 1: enviar_boton_link — validaciones ##########');
    const rMalo = await toolExecutor.ejecutar('enviar_boton_link', { mensaje: 'x', texto_boton: 'Ver', url: 'ftp://no-es-http' }, { conversacionId: 't', clienteId: CLIENTE_ID, agenteId: '13' });
    console.log('URL inválida (no http/https):', rMalo.texto);
    console.log(rMalo.botonLink ? '❌ ERROR: debería haber rechazado la url' : '✅ Correctamente rechazado');
    console.log('\n########## CASO 2: enviar_boton_link — envío real ##########');
    const rLink = await toolExecutor.ejecutar('enviar_boton_link', { mensaje: 'Podés ver el catálogo completo acá:', texto_boton: 'Ver catálogo', url: 'https://example.com/catalogo' }, { conversacionId: 't', clienteId: CLIENTE_ID, agenteId: '13' });
    console.log('Resultado tool:', JSON.stringify(rLink.botonLink));
    await waService.enviarBotonLink(CONTACTO, rLink.botonLink.mensaje, rLink.botonLink.textoBoton, rLink.botonLink.url, config);
    console.log('✅ Enviado vía enviarBotonLink (revisar arriba si hubo WARN)');
    const conv1 = await conversacionService.crear({ agenteId: '13', contacto: CONTACTO, canal: 'whatsapp' }, '1', CLIENTE_ID);
    await conversacionService.agregarMensaje(conv1.id, { role: 'assistant', content: rLink.botonLink.mensaje, enlace: { texto: rLink.botonLink.textoBoton, url: rLink.botonLink.url } });
    conversacionesCreadas.push(conv1.id);
    console.log('\n\n########## CASO 3: solicitar_ubicacion — envío real ##########');
    const rUbic = await toolExecutor.ejecutar('solicitar_ubicacion', { mensaje: 'Para calcular el envío, ¿podrías compartir tu ubicación?' }, { conversacionId: 't', clienteId: CLIENTE_ID, agenteId: '13' });
    console.log('Resultado tool:', JSON.stringify(rUbic.solicitudUbicacion));
    await waService.enviarSolicitudUbicacion(CONTACTO, rUbic.solicitudUbicacion.mensaje, config);
    console.log('✅ Enviado vía enviarSolicitudUbicacion (revisar arriba si hubo WARN)');
    const conv2 = await conversacionService.crear({ agenteId: '13', contacto: CONTACTO + '2', canal: 'whatsapp' }, '1', CLIENTE_ID);
    await conversacionService.agregarMensaje(conv2.id, { role: 'assistant', content: rUbic.solicitudUbicacion.mensaje, pidioUbicacion: true });
    conversacionesCreadas.push(conv2.id);
    console.log('\n\n########## CASO 4: RECEPCIÓN de una ubicación real (simulando el webhook de Meta) ##########');
    await webhookService.procesarMensajeEntrante({
        id: 'wamid.LOC1',
        from: CONTACTO + '3',
        timestamp: String(Date.now()),
        type: 'location',
        location: { latitude: -17.783327, longitude: -63.182140, name: 'Santa Cruz de la Sierra', address: 'Bolivia' },
    }, 'Test Ubicacion', PHONE_NUMBER_ID);
    await app.close();
    console.log('\n\nCONVS_PARA_LIMPIAR=' + conversacionesCreadas.join(','));
    process.exit(0);
}
main().catch(e => { console.error('ERROR FATAL:', e); process.exit(1); });
//# sourceMappingURL=test-link-ubicacion.js.map