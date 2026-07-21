import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Agente } from './entity/agente.entity'
import { Herramienta } from '../herramienta/entity/herramienta.entity'
import { AgenteService } from './service/agente.service'
import { AgenteController } from './controller/agente.controller'
import { ClienteModule } from '../cliente/cliente.module'

@Module({
  imports: [TypeOrmModule.forFeature([Agente, Herramienta]), ClienteModule],
  providers: [AgenteService],
  exports: [AgenteService],
  controllers: [AgenteController],
})
export class AgenteModule {}
