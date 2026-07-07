import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OportunidadVenta } from './entity/oportunidad-venta.entity'
import { Conversacion } from '../conversacion/entity/conversacion.entity'
import { Usuario } from '../usuario/entity/usuario.entity'
import { OportunidadService } from './service/oportunidad.service'
import { OportunidadController } from './controller/oportunidad.controller'

@Module({
  imports: [TypeOrmModule.forFeature([OportunidadVenta, Conversacion, Usuario])],
  controllers: [OportunidadController],
  providers: [OportunidadService],
  exports: [OportunidadService],
})
export class OportunidadModule {}
