import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Herramienta } from './entity/herramienta.entity'
import { HerramientaService } from './service/herramienta.service'
import { HerramientaController } from './controller/herramienta.controller'
import { AgenteModule } from '../agente/agente.module'

@Module({
  imports: [TypeOrmModule.forFeature([Herramienta]), AgenteModule],
  providers: [HerramientaService],
  exports: [HerramientaService],
  controllers: [HerramientaController],
})
export class HerramientaModule {}
