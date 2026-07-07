import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BaseConocimiento } from './entity/base-conocimiento.entity'
import { BaseConocimientoService } from './service/base-conocimiento.service'
import { BaseConocimientoController } from './controller/base-conocimiento.controller'
import { AgenteModule } from '../agente/agente.module'

@Module({
  imports: [TypeOrmModule.forFeature([BaseConocimiento]), AgenteModule],
  providers: [BaseConocimientoService],
  exports: [BaseConocimientoService],
  controllers: [BaseConocimientoController],
})
export class BaseConocimientoModule {}
