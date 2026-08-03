"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const whatsapp_webhook_service_1 = require("./src/core/whatsapp/service/whatsapp-webhook.service");
const whatsapp_service_1 = require("./src/core/whatsapp/service/whatsapp.service");
const typeorm_1 = require("@nestjs/typeorm");
const CONTACTO = '59170000077';
const PHONE_NUMBER_ID = '1267995426390859';
const CLIENTE_ID = '4';
async function main() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, { logger: ['log', 'warn', 'error'] });
    const webhookSvc = app.get(whatsapp_webhook_service_1.WhatsappWebhookService);
    const waSvc = app.get(whatsapp_service_1.WhatsappService);
    console.log('\n=== PRUEBA 1: RECEPCIÓN de imagen entrante (simulando el webhook real de Meta) ===');
    await webhookSvc.procesarMensajeEntrante({
        id: 'wamid.IMG1',
        from: CONTACTO,
        timestamp: String(Date.now()),
        type: 'image',
        image: { id: 'fake_media_id_123', mime_type: 'image/jpeg', sha256: 'abc' },
    }, 'Test Adjuntos', PHONE_NUMBER_ID);
    console.log('\n=== PRUEBA 2: RECEPCIÓN de documento entrante ===');
    await webhookSvc.procesarMensajeEntrante({
        id: 'wamid.DOC1',
        from: CONTACTO,
        timestamp: String(Date.now()),
        type: 'document',
        document: { id: 'fake_doc_id_456', filename: 'comprobante.pdf', mime_type: 'application/pdf' },
    }, 'Test Adjuntos', PHONE_NUMBER_ID);
    console.log('\n=== PRUEBA 3: RECEPCIÓN de audio/nota de voz entrante ===');
    await webhookSvc.procesarMensajeEntrante({
        id: 'wamid.AUD1',
        from: CONTACTO,
        timestamp: String(Date.now()),
        type: 'audio',
        audio: { id: 'fake_audio_id_789', mime_type: 'audio/ogg' },
    }, 'Test Adjuntos', PHONE_NUMBER_ID);
    console.log('\n=== PRUEBA 4: ENVÍO real de imagen vía WhatsappService.enviarImagen (URL pública) ===');
    const confRepo = app.get((0, typeorm_1.getRepositoryToken)(require('./src/core/cliente/entity/configuracion-cliente.entity').ConfiguracionCliente));
    const config = await waSvc.obtenerConfig(CLIENTE_ID);
    await waSvc.enviarImagen(CONTACTO, 'https://picsum.photos/400/300', 'Prueba de envío de imagen manual', config);
    console.log('\n=== Listo — revisando qué quedó guardado en la conversación ===');
    await app.close();
    process.exit(0);
}
main().catch(e => { console.error('ERROR FATAL:', e); process.exit(1); });
//# sourceMappingURL=test-adjuntos.js.map