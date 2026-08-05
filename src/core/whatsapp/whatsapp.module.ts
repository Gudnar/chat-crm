import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WhatsappController } from './controller/whatsapp.controller'
import { PlantillaWhatsappController } from './controller/plantilla-whatsapp.controller'
import { FlowWhatsappController } from './controller/flow-whatsapp.controller'
import { WhatsappService } from './service/whatsapp.service'
import { WhatsappWebhookService } from './service/whatsapp-webhook.service'
import { RecordatorioService } from './service/recordatorio.service'
import { RecordatorioCitaService } from './service/recordatorio-cita.service'
import { PlantillaWhatsappService } from './service/plantilla-whatsapp.service'
import { FlowWhatsappService } from './service/flow-whatsapp.service'
import { PlantillaWhatsapp } from './entity/plantilla-whatsapp.entity'
import { FlowWhatsapp } from './entity/flow-whatsapp.entity'
import { ClienteModule } from '../cliente/cliente.module'
import { ConversacionModule } from '../conversacion/conversacion.module'
import { AgenteModule } from '../agente/agente.module'
import { HerramientaModule } from '../herramienta/herramienta.module'
import { ToolExecutorService } from '../herramienta/service/tool-executor.service'
import { BaseConocimientoModule } from '../base-conocimiento/base-conocimiento.module'
import { ProductoModule } from '../producto/producto.module'
import { RedSocialModule } from '../red-social/red-social.module'
import { RecursoModule } from '../recurso/recurso.module'
import { ReservacionModule } from '../reservacion/reservacion.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([PlantillaWhatsapp, FlowWhatsapp]),
    ClienteModule,
    ConversacionModule,
    AgenteModule,
    HerramientaModule,
    BaseConocimientoModule,
    ProductoModule,
    RecursoModule,
    ReservacionModule,
    forwardRef(() => RedSocialModule),
  ],
  controllers: [WhatsappController, PlantillaWhatsappController, FlowWhatsappController],
  providers: [WhatsappService, WhatsappWebhookService, ToolExecutorService, RecordatorioService, RecordatorioCitaService, PlantillaWhatsappService, FlowWhatsappService],
  exports: [WhatsappService, PlantillaWhatsappService, FlowWhatsappService],
})
export class WhatsappModule {}
