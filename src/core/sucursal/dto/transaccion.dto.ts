import { IsNotEmpty, IsOptional, IsString, IsNumber, IsIn, IsDate } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CreateTransaccionDto {
  @ApiProperty({ example: 'venta' })
  @IsNotEmpty()
  @IsIn(['venta', 'reembolso', 'gasto', 'ingreso_manual'])
  tipo: string

  @ApiProperty({ required: false, example: 'qr' })
  @IsOptional()
  @IsIn(['qr', 'efectivo', 'transferencia', 'otro'])
  metodoPago?: string

  @ApiProperty({ example: 150.00 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  monto: number

  @ApiProperty({ required: false, example: '1' })
  @IsOptional()
  @Type(() => String)
  pedidoId?: string

  @ApiProperty({ required: false, example: '1' })
  @IsOptional()
  @Type(() => String)
  cajaSucursalId?: string

  @ApiProperty({ required: false, example: 'REF-001' })
  @IsOptional()
  @IsString()
  referencia?: string

  @ApiProperty({ required: false, example: 'Venta producto A' })
  @IsOptional()
  @IsString()
  descripcion?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fecha?: Date
}
