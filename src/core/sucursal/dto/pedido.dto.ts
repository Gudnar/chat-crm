import { IsNotEmpty, IsOptional, IsString, IsArray, IsNumber, IsObject, IsIn } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CreatePedidoDto {
  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  @Type(() => String)
  sucursalId: string

  @ApiProperty({ example: '+59123456789' })
  @IsNotEmpty()
  @IsString()
  contactoTelefono: string

  @ApiProperty({ required: false, example: '1' })
  @IsOptional()
  @Type(() => String)
  clienteFinalId?: string

  @ApiProperty({ required: false, example: '1' })
  @IsOptional()
  @Type(() => String)
  conversacionId?: string

  @ApiProperty({ example: [{ productoId: '1', nombre: 'Producto A', cantidad: 2, precioUnitario: 100, subtotal: 200 }] })
  @IsNotEmpty()
  @IsArray()
  items: Array<{
    productoId: string
    nombre: string
    cantidad: number
    precioUnitario: number
    subtotal: number
    notas?: string
  }>

  @ApiProperty({ example: 200 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  subtotal: number

  @ApiProperty({ required: false, example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  descuento?: number

  @ApiProperty({ example: 200 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  total: number

  @ApiProperty({ required: false, example: 'recojo' })
  @IsOptional()
  @IsIn(['recojo', 'delivery'])
  tipoEntrega?: 'recojo' | 'delivery'

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  direccionEntrega?: {
    direccion: string
    latitud?: number
    longitud?: number
    notas?: string
  }

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notas?: string
}

export class UpdatePedidoEstadoDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsIn(['pendiente_confirmacion', 'confirmado', 'en_preparacion', 'listo', 'en_camino', 'entregado', 'cancelado'])
  estadoPedido: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  motivoCancelacion?: string
}

export class UpdatePedidoEstadoPagoDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsIn(['pendiente', 'pagado', 'parcial', 'anulado'])
  estadoPago: string
}
