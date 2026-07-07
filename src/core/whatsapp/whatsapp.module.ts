import { Module, forwardRef } from '@nestjs/common'
import { WhatsappController } from './controller/whatsapp.controller'
import { WhatsappService } from './service/whatsapp.service'
import { WhatsappWebhookService } from './service/whatsapp-webhook.service'
import { ClienteModule } from '../cliente/cliente.module'
import { ConversacionModule } from '../conversacion/conversacion.module'
import { AgenteModule } from '../agente/agente.module'
import { HerramientaModule } from '../herramienta/herramienta.module'
import { ToolExecutorService } from '../herramienta/service/tool-executor.service'
import { BaseConocimientoModule } from '../base-conocimiento/base-conocimiento.module'
import { ProductoModule } from '../producto/producto.module'
import { RedSocialModule } from '../red-social/red-social.module'

@Module({
  imports: [
    ClienteModule,
    ConversacionModule,
    AgenteModule,
    HerramientaModule,
    BaseConocimientoModule,
    ProductoModule,
    forwardRef(() => RedSocialModule),
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService, WhatsappWebhookService, ToolExecutorService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
