import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Configuracion } from './entity/configuracion.entity'
import { ConfiguracionService } from './service/configuracion.service'
import { ConfiguracionController } from './controller/configuracion.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Configuracion])],
  providers: [ConfiguracionService],
  exports: [ConfiguracionService],
  controllers: [ConfiguracionController],
})
export class ConfiguracionModule {}
