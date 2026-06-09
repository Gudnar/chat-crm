import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Cliente } from '../cliente/entity/cliente.entity'
import { Usuario } from '../usuario/entity/usuario.entity'
import { RolCliente } from './entity/rol-cliente.entity'
import { MiCuentaService } from './service/mi-cuenta.service'
import { MiCuentaController } from './controller/mi-cuenta.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, Usuario, RolCliente])],
  providers: [MiCuentaService],
  controllers: [MiCuentaController],
  exports: [MiCuentaService],
})
export class MiCuentaModule {}
