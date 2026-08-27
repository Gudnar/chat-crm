import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Reserva } from './entity/reserva.entity'
import { HorarioAgente } from './entity/horario-agente.entity'
import { ServicioAgente } from './entity/servicio-agente.entity'
import { ExcepcionHorarioAgente } from './entity/excepcion-horario-agente.entity'
import { ReservacionService } from './service/reservacion.service'
import { HorarioAgenteService } from './service/horario-agente.service'
import { ServicioAgenteService } from './service/servicio-agente.service'
import { ExcepcionHorarioAgenteService } from './service/excepcion-horario-agente.service'
import { ReservacionController } from './controller/reservacion.controller'
import { HorarioAgenteController } from './controller/horario-agente.controller'
import { ServicioAgenteController } from './controller/servicio-agente.controller'
import { ExcepcionHorarioAgenteController } from './controller/excepcion-horario-agente.controller'
import { AgenteModule } from '../agente/agente.module'
import { AgenteHumanoModule } from '../agente-humano/agente-humano.module'
import { GoogleCalendarModule } from '../google-calendar/google-calendar.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Reserva, HorarioAgente, ServicioAgente, ExcepcionHorarioAgente]),
    AgenteModule,
    AgenteHumanoModule,
    // GoogleCalendarModule necesita ExcepcionHorarioAgenteService (sondeo Google→CRM) y
    // ReservacionService necesita GoogleCalendarSyncService (reflejar reservas en Google)
    // — ciclo resuelto en ambos lados con forwardRef (ver google-calendar.module.ts).
    forwardRef(() => GoogleCalendarModule),
  ],
  providers: [ExcepcionHorarioAgenteService, ReservacionService, HorarioAgenteService, ServicioAgenteService],
  exports: [ExcepcionHorarioAgenteService, ReservacionService, HorarioAgenteService, ServicioAgenteService],
  controllers: [ReservacionController, HorarioAgenteController, ServicioAgenteController, ExcepcionHorarioAgenteController],
})
export class ReservacionModule {}
