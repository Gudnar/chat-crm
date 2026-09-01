import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Reserva } from './entity/reserva.entity'
import { ReservaService } from './service/reserva.service'
import { ReservaController } from './controller/reserva.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Reserva])],
  controllers: [ReservaController],
  providers: [ReservaService],
  exports: [ReservaService],
})
export class ReservaModule {}
