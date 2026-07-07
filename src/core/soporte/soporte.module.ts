import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CasoSoporte } from './entity/caso.entity'
import { SoporteService } from './service/soporte.service'
import { SoporteController } from './controller/soporte.controller'

@Module({
  imports: [TypeOrmModule.forFeature([CasoSoporte])],
  controllers: [SoporteController],
  providers: [SoporteService],
  exports: [SoporteService],
})
export class SoporteModule {}
