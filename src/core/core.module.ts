import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthenticationModule } from './authentication/authentication.module'
import { UsuarioModule } from './usuario/usuario.module'
import { AgenteModule } from './agente/agente.module'
import { HerramientaModule } from './herramienta/herramienta.module'
import { ConversacionModule } from './conversacion/conversacion.module'
import { ConfiguracionModule } from './configuracion/configuracion.module'
import { WhatsappModule } from './whatsapp/whatsapp.module'
import { ClienteModule } from './cliente/cliente.module'
import { MiCuentaModule } from './mi-cuenta/mi-cuenta.module'
import { RedSocialModule } from './red-social/red-social.module'
import { RemarketingModule } from './remarketing/remarketing.module'
import { BaseConocimientoModule } from './base-conocimiento/base-conocimiento.module'
import { ProductoModule } from './producto/producto.module'
import { SoporteModule } from './soporte/soporte.module'
import { AgenteHumanoModule } from './agente-humano/agente-humano.module'
import { OportunidadModule } from './oportunidad/oportunidad.module'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST') || 'localhost',
        port: Number(config.get('DB_PORT')) || 5432,
        username: config.get('DB_USERNAME') || 'postgres',
        password: config.get('DB_PASSWORD') || 'postgres',
        database: config.get('DB_DATABASE') || 'ide_ia_db',
        schema: config.get('DB_SCHEMA') || 'public',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: config.get('LOG_SQL') === 'true',
      }),
    }),
    AuthenticationModule,
    UsuarioModule,
    AgenteModule,
    HerramientaModule,
    ConversacionModule,
    ConfiguracionModule,
    WhatsappModule,
    ClienteModule,
    MiCuentaModule,
    RedSocialModule,
    RemarketingModule,
    BaseConocimientoModule,
    ProductoModule,
    SoporteModule,
    AgenteHumanoModule,
    OportunidadModule,
  ],
})
export class CoreModule {}
