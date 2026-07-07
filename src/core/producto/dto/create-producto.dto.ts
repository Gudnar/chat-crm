import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateProductoDto {
  @ApiProperty({ example: 'Nike Air Max 2024' })
  @IsNotEmpty()
  @IsString()
  nombre: string

  @ApiProperty({ required: false, example: 'Zapatilla deportiva para running' })
  @IsOptional()
  @IsString()
  descripcion?: string

  @ApiProperty({ required: false, example: 'Nike' })
  @IsOptional()
  @IsString()
  marca?: string

  @ApiProperty({ required: false, example: 'Air Max 270' })
  @IsOptional()
  @IsString()
  modelo?: string

  @ApiProperty({ required: false, example: 'Calzado' })
  @IsOptional()
  @IsString()
  categoria?: string

  @ApiProperty({ example: 350.00 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  precio: number

  @ApiProperty({ required: false, example: 299.90 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  precioOferta?: number

  @ApiProperty({ required: false, example: 'PEN', description: 'Código de moneda: PEN, USD, etc.' })
  @IsOptional()
  @IsString()
  moneda?: string

  @ApiProperty({ required: false, example: 15 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number

  @ApiProperty({ required: false, example: ['https://ejemplo.com/imagen.jpg'] })
  @IsOptional()
  @IsArray()
  imagenes?: string[]

  @ApiProperty({ required: false, example: { color: 'rojo', talla: 'M', garantia: '1 año' } })
  @IsOptional()
  @IsObject()
  detalles?: Record<string, any>
}

export class UpdateProductoDto extends CreateProductoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean

  @IsOptional()
  nombre: string

  @IsOptional()
  precio: number
}
