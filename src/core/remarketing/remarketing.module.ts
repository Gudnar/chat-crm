import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CampanaRemarketing } from './entity/campana-remarketing.entity'
import { EnvioRemarketing } from './entity/envio-remarketing.entity'
import { RemarketingService } from './service/remarketing.service'
import { RemarketingController } from './controller/remarketing.controller'
import { WhatsappModule } from '../whatsapp/whatsapp.module'
import { ConversacionModule } from '../conversacion/conversacion.module'
import { ClienteModule } from '../cliente/cliente.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([CampanaRemarketing, EnvioRemarketing]),
    WhatsappModule,
    ConversacionModule,
    ClienteModule,
  ],
  providers: [RemarketingService],
  controllers: [RemarketingController],
})
export class RemarketingModule {}
