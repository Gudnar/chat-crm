import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Sucursal } from './entity/sucursal.entity'
import { InventarioSucursal } from './entity/inventario-sucursal.entity'
import { ClienteFinal } from './entity/cliente-final.entity'
import { Pedido } from './entity/pedido.entity'
import { Transaccion } from './entity/transaccion.entity'
import { CajaSucursal } from './entity/caja-sucursal.entity'
import { SucursalService } from './service/sucursal.service'
import { InventarioSucursalService } from './service/inventario-sucursal.service'
import { ClienteFinalService } from './service/cliente-final.service'
import { PedidoService } from './service/pedido.service'
import { TransaccionService } from './service/transaccion.service'
import { CajaSucursalService } from './service/caja-sucursal.service'
import { SucursalController } from './controller/sucursal.controller'

@Module({
  imports: [TypeOrmModule.forFeature([
    Sucursal,
    InventarioSucursal,
    ClienteFinal,
    Pedido,
    Transaccion,
    CajaSucursal,
  ])],
  controllers: [SucursalController],
  providers: [
    SucursalService,
    InventarioSucursalService,
    ClienteFinalService,
    PedidoService,
    TransaccionService,
    CajaSucursalService,
  ],
  exports: [
    SucursalService,
    InventarioSucursalService,
    ClienteFinalService,
    PedidoService,
    TransaccionService,
    CajaSucursalService,
  ],
})
export class SucursalModule {}
