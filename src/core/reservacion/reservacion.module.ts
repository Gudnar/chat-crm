import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Reserva } from './entity/reserva.entity'
import { HorarioAgente } from './entity/horario-agente.entity'
import { ServicioAgente } from './entity/servicio-agente.entity'
import { ReservacionService } from './service/reservacion.service'
import { HorarioAgenteService } from './service/horario-agente.service'
import { ServicioAgenteService } from './service/servicio-agente.service'
import { ReservacionController } from './controller/reservacion.controller'
import { HorarioAgenteController } from './controller/horario-agente.controller'
import { ServicioAgenteController } from './controller/servicio-agente.controller'
import { AgenteModule } from '../agente/agente.module'
import { AgenteHumanoModule } from '../agente-humano/agente-humano.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Reserva, HorarioAgente, ServicioAgente]),
    AgenteModule,
    AgenteHumanoModule,
  ],
  providers: [ReservacionService, HorarioAgenteService, ServicioAgenteService],
  exports: [ReservacionService, HorarioAgenteService, ServicioAgenteService],
  controllers: [ReservacionController, HorarioAgenteController, ServicioAgenteController],
})
export class ReservacionModule {}
