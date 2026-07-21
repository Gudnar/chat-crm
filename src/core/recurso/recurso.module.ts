import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Recurso } from './entity/recurso.entity'
import { RecursoService } from './service/recurso.service'
import { RecursoController } from './controller/recurso.controller'
import { ClienteModule } from '../cliente/cliente.module'

@Module({
  imports: [TypeOrmModule.forFeature([Recurso]), ClienteModule],
  providers: [RecursoService],
  exports: [RecursoService],
  controllers: [RecursoController],
})
export class RecursoModule {}
