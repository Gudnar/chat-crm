import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RedSocialCuenta } from './entity/red-social-cuenta.entity'
import { RedSocialPost } from './entity/red-social-post.entity'
import { RedSocialService } from './service/red-social.service'
import { RedSocialWebhookService } from './service/red-social-webhook.service'
import { RedSocialController } from './controller/red-social.controller'
import { RedSocialClienteController } from './controller/red-social-cliente.controller'
import { ClienteModule } from '../cliente/cliente.module'
import { ConversacionModule } from '../conversacion/conversacion.module'
import { AgenteModule } from '../agente/agente.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([RedSocialCuenta, RedSocialPost]),
    ClienteModule,
    ConversacionModule,
    AgenteModule,
  ],
  controllers: [RedSocialController, RedSocialClienteController],
  providers: [RedSocialService, RedSocialWebhookService],
  exports: [RedSocialService, RedSocialWebhookService],
})
export class RedSocialModule {}
