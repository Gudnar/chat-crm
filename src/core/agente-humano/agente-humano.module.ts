import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Agente } from '../agente/entity/agente.entity'
import { Usuario } from '../usuario/entity/usuario.entity'
import { Conversacion } from '../conversacion/entity/conversacion.entity'
import { AsignacionAgenteHumano } from './entity/asignacion-agente-humano.entity'
import { ActividadAgenteHumano } from './entity/actividad-agente-humano.entity'
import { AgenteHumanoService } from './service/agente-humano.service'
import { AsignacionService } from './service/asignacion.service'
import { AgenteHumanoController } from './controller/agente-humano.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Agente,
      Usuario,
      Conversacion,
      AsignacionAgenteHumano,
      ActividadAgenteHumano,
    ]),
  ],
  providers: [AgenteHumanoService, AsignacionService],
  exports: [AgenteHumanoService, AsignacionService],
  controllers: [AgenteHumanoController],
})
export class AgenteHumanoModule {}
