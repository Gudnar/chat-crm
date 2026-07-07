import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { Producto } from './entity/producto.entity'
import { ProductoService } from './service/producto.service'
import { ProductoController } from './controller/producto.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Producto]), ConfigModule],
  providers: [ProductoService],
  exports: [ProductoService],
  controllers: [ProductoController],
})
export class ProductoModule {}
