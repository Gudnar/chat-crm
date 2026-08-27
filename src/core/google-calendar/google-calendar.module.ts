import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AgenteGoogleCalendar } from './entity/agente-google-calendar.entity'
import { GoogleCalendarService } from './service/google-calendar.service'
import { AgenteGoogleCalendarService } from './service/agente-google-calendar.service'
import { GoogleCalendarSyncService } from './service/google-calendar-sync.service'
import { GoogleCalendarPollingService } from './service/google-calendar-polling.service'
import { GoogleCalendarController } from './controller/google-calendar.controller'
import { AgenteHumanoModule } from '../agente-humano/agente-humano.module'
import { ReservacionModule } from '../reservacion/reservacion.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([AgenteGoogleCalendar]),
    AgenteHumanoModule,
    // ReservacionModule necesita GoogleCalendarSyncService (para reflejar reservas en
    // Google) y GoogleCalendarPollingService necesita ExcepcionHorarioAgenteService (para
    // reflejar bloqueos de Google en el CRM) — ciclo resuelto en ambos lados con forwardRef.
    forwardRef(() => ReservacionModule),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'ide_ia_secret',
      }),
    }),
  ],
  providers: [GoogleCalendarService, AgenteGoogleCalendarService, GoogleCalendarSyncService, GoogleCalendarPollingService],
  exports: [GoogleCalendarSyncService],
  controllers: [GoogleCalendarController],
})
export class GoogleCalendarModule {}
