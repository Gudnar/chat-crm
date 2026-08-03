"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const tool_executor_service_1 = require("./src/core/herramienta/service/tool-executor.service");
const whatsapp_service_1 = require("./src/core/whatsapp/service/whatsapp.service");
const conversacion_service_1 = require("./src/core/conversacion/service/conversacion.service");
const CONTACTO = '59170000066';
const CLIENTE_ID = '4';
const conversacionesCreadas = [];
async function main() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, { logger: ['log', 'warn', 'error'] });
    const toolExecutor = app.get(tool_executor_service_1.ToolExecutorService);
    const waService = app.get(whatsapp_service_1.WhatsappService);
    const conversacionService = app.get(conversacion_service_1.ConversacionService);
    const config = await waService.obtenerConfig(CLIENTE_ID);
    console.log('\n\n########## CASO 1: 2 opciones (botones) ##########');
    const r1 = await toolExecutor.ejecutar('preguntar_opciones', { pregunta: '¿Quieres la Opción 1 o la Opción 2?', opciones: [{ texto: 'Opción 1' }, { texto: 'Opción 2' }] }, { conversacionId: 'test', clienteId: CLIENTE_ID, agenteId: '13' });
    console.log('botones.length =', r1.opciones?.botones.length, '→ debería ir por enviarBotones');
    if (r1.opciones.botones.length <= 3) {
        await waService.enviarBotones(CONTACTO, r1.opciones.pregunta, r1.opciones.botones, config);
        console.log('✅ Enviado vía enviarBotones (revisar arriba si hubo WARN)');
    }
    else {
        console.log('❌ ERROR: 2 opciones no debería activar la lista');
    }
    const conv1 = await conversacionService.crear({ agenteId: '13', contacto: CONTACTO, canal: 'whatsapp' }, '1', CLIENTE_ID);
    await conversacionService.agregarMensaje(conv1.id, { role: 'assistant', content: r1.opciones.pregunta, interactivo: r1.opciones });
    conversacionesCreadas.push(conv1.id);
    console.log('\n\n########## CASO 2: 3 opciones exactas (límite de botones) ##########');
    const r2 = await toolExecutor.ejecutar('preguntar_opciones', { pregunta: '¿Qué talla prefieres?', opciones: [{ texto: 'S' }, { texto: 'M' }, { texto: 'L' }] }, { conversacionId: 'test', clienteId: CLIENTE_ID, agenteId: '13' });
    console.log('botones.length =', r2.opciones?.botones.length, '→ debería ir por enviarBotones (límite)');
    if (r2.opciones.botones.length <= 3) {
        await waService.enviarBotones(CONTACTO, r2.opciones.pregunta, r2.opciones.botones, config);
        console.log('✅ Enviado vía enviarBotones');
    }
    console.log('\n\n########## CASO 3: 6 opciones (lista desplegable) ##########');
    const r3 = await toolExecutor.ejecutar('preguntar_opciones', {
        pregunta: '¿Qué sucursal te queda más cerca?',
        opciones: [{ texto: 'Centro' }, { texto: 'Norte' }, { texto: 'Sur' }, { texto: 'Este' }, { texto: 'Oeste' }, { texto: 'Aeropuerto' }],
    }, { conversacionId: 'test', clienteId: CLIENTE_ID, agenteId: '13' });
    console.log('botones.length =', r3.opciones?.botones.length, '→ debería ir por enviarLista');
    if (r3.opciones.botones.length > 3) {
        await waService.enviarLista(CONTACTO, r3.opciones.pregunta, 'Ver opciones', r3.opciones.botones, config);
        console.log('✅ Enviado vía enviarLista (revisar arriba si hubo WARN)');
    }
    else {
        console.log('❌ ERROR: 6 opciones debería activar la lista, no botones');
    }
    const conv3 = await conversacionService.crear({ agenteId: '13', contacto: CONTACTO + '9', canal: 'whatsapp' }, '1', CLIENTE_ID);
    await conversacionService.agregarMensaje(conv3.id, { role: 'assistant', content: r3.opciones.pregunta, interactivo: r3.opciones });
    conversacionesCreadas.push(conv3.id);
    console.log('\n\n########## CASO 4: 10 opciones exactas (límite máximo) ##########');
    const r4 = await toolExecutor.ejecutar('preguntar_opciones', { pregunta: '¿Qué producto te interesa?', opciones: Array.from({ length: 10 }, (_, i) => ({ texto: `Producto ${i + 1}` })) }, { conversacionId: 'test', clienteId: CLIENTE_ID, agenteId: '13' });
    console.log('botones.length =', r4.opciones?.botones.length, '(debe ser 10, no más)');
    if (r4.opciones.botones.length > 3) {
        await waService.enviarLista(CONTACTO, r4.opciones.pregunta, 'Ver opciones', r4.opciones.botones, config);
        console.log('✅ Enviado vía enviarLista');
    }
    console.log('\n\n########## CASO 5: 11 opciones (debe rechazarse) ##########');
    const r5 = await toolExecutor.ejecutar('preguntar_opciones', { pregunta: '¿Cuál eliges?', opciones: Array.from({ length: 11 }, (_, i) => ({ texto: `Op ${i + 1}` })) }, { conversacionId: 'test', clienteId: CLIENTE_ID, agenteId: '13' });
    console.log('Resultado:', r5.texto);
    console.log(r5.opciones ? '❌ ERROR: debería haber rechazado 11 opciones' : '✅ Correctamente rechazado, no se generó nada para enviar');
    console.log('\n\n########## CASO 6: 1 sola opción (debe rechazarse) ##########');
    const r6 = await toolExecutor.ejecutar('preguntar_opciones', { pregunta: '¿Confirmas?', opciones: [{ texto: 'Sí' }] }, { conversacionId: 'test', clienteId: CLIENTE_ID, agenteId: '13' });
    console.log('Resultado:', r6.texto);
    console.log(r6.opciones ? '❌ ERROR: debería haber rechazado 1 sola opción' : '✅ Correctamente rechazado');
    console.log('\n\nCONVS_PARA_LIMPIAR=' + conversacionesCreadas.join(','));
    await app.close();
    process.exit(0);
}
main().catch(e => { console.error('ERROR FATAL:', e); process.exit(1); });
//# sourceMappingURL=test-botones-lista.js.map