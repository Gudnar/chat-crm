"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const tool_executor_service_1 = require("./src/core/herramienta/service/tool-executor.service");
const whatsapp_service_1 = require("./src/core/whatsapp/service/whatsapp.service");
const conversacion_service_1 = require("./src/core/conversacion/service/conversacion.service");
const CONTACTO = '59170000055';
const CLIENTE_ID = '4';
async function main() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, { logger: ['log', 'warn', 'error'] });
    const toolExecutor = app.get(tool_executor_service_1.ToolExecutorService);
    const waService = app.get(whatsapp_service_1.WhatsappService);
    const conversacionService = app.get(conversacion_service_1.ConversacionService);
    console.log('\n=== PASO 1: ejecutar la tool preguntar_opciones directamente ===');
    const resultado = await toolExecutor.ejecutar('preguntar_opciones', { pregunta: '¿Quieres la Opción 1 o la Opción 2?', opciones: [{ texto: 'Opción 1' }, { texto: 'Opción 2' }] }, { conversacionId: 'test', clienteId: CLIENTE_ID, agenteId: '13' });
    console.log('Resultado de la tool:', JSON.stringify(resultado, null, 2));
    console.log('\n=== PASO 2: enviar los botones de verdad por WhatsApp ===');
    const config = await waService.obtenerConfig(CLIENTE_ID);
    if (resultado.opciones) {
        await waService.enviarBotones(CONTACTO, resultado.opciones.pregunta, resultado.opciones.botones, config);
    }
    console.log('Envío de botones completado (revisar logs de arriba por error/warn)');
    console.log('\n=== PASO 3: crear conversación y persistir el mensaje interactivo ===');
    const conv = await conversacionService.crear({ agenteId: '13', contacto: CONTACTO, canal: 'whatsapp' }, '1', CLIENTE_ID);
    const guardado = await conversacionService.agregarMensaje(conv.id, {
        role: 'assistant',
        content: resultado.opciones.pregunta,
        interactivo: resultado.opciones,
    });
    console.log('Mensaje guardado:', JSON.stringify(guardado.mensajes, null, 2));
    console.log('CONV_ID_PARA_LIMPIAR=' + conv.id);
    await app.close();
    process.exit(0);
}
main().catch(e => { console.error('ERROR FATAL:', e); process.exit(1); });
//# sourceMappingURL=test-opciones.js.map