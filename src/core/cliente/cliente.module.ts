import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Cliente } from './entity/cliente.entity'
import { ConfiguracionCliente } from './entity/configuracion-cliente.entity'
import { ClienteService } from './service/cliente.service'
import { ConfiguracionClienteService } from './service/configuracion-cliente.service'
import { ClienteController } from './controller/cliente.controller'
import { ConfiguracionClienteController } from './controller/configuracion-cliente.controller'
import { MiCuentaModule } from '../mi-cuenta/mi-cuenta.module'

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, ConfiguracionCliente]), MiCuentaModule],
  providers: [ClienteService, ConfiguracionClienteService],
  exports: [ClienteService, ConfiguracionClienteService],
  controllers: [ClienteController, ConfiguracionClienteController],
})
export class ClienteModule {}
