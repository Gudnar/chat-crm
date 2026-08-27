import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ArticuloTienda } from './entity/articulo-tienda.entity'
import { CarritoTienda } from './entity/carrito-tienda.entity'
import { CategoriaTienda } from './entity/categoria-tienda.entity'
import { PromocionTienda } from './entity/promocion-tienda.entity'
import { ArticuloSucursal } from './entity/articulo-sucursal.entity'
import { TiendaService } from './service/tienda.service'
import { TiendaPublicaService } from './service/tienda-publica.service'
import { PromocionTiendaService } from './service/promocion-tienda.service'
import { TiendaController } from './controller/tienda.controller'
import { TiendaPublicaController } from './controller/tienda-publica.controller'
import { ClienteModule } from '../cliente/cliente.module'
import { ConversacionModule } from '../conversacion/conversacion.module'
import { WhatsappModule } from '../whatsapp/whatsapp.module'
import { SucursalModule } from '../sucursal/sucursal.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([ArticuloTienda, CarritoTienda, CategoriaTienda, PromocionTienda, ArticuloSucursal]),
    SucursalModule,
    ClienteModule,
    ConversacionModule,
    forwardRef(() => WhatsappModule),
  ],
  providers: [TiendaService, TiendaPublicaService, PromocionTiendaService],
  exports: [TiendaService, TiendaPublicaService, PromocionTiendaService],
  controllers: [TiendaController, TiendaPublicaController],
})
export class TiendaModule {}
