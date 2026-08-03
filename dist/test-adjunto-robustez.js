"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const whatsapp_webhook_service_1 = require("./src/core/whatsapp/service/whatsapp-webhook.service");
const CONTACTO = '59170000088';
const PHONE_NUMBER_ID = '1267995426390859';
async function main() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, { logger: ['log', 'warn', 'error'] });
    const svc = app.get(whatsapp_webhook_service_1.WhatsappWebhookService);
    console.log('\n=== Imagen con media_id INVÁLIDO (Meta va a rechazar la descarga) ===');
    await svc.procesarMensajeEntrante({ id: 'wamid.ROB1', from: CONTACTO, timestamp: String(Date.now()), type: 'image', image: { id: 'id_invalido_no_existe', mime_type: 'image/jpeg', sha256: 'x' } }, 'Test Robustez', PHONE_NUMBER_ID);
    await app.close();
    process.exit(0);
}
main().catch(e => { console.error('ERROR FATAL:', e); process.exit(1); });
//# sourceMappingURL=test-adjunto-robustez.js.map