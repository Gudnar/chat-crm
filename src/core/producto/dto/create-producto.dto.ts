import { IsArray, IsBoolean, IsDateString, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'
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

  // precio/precioOferta son columnas `decimal` — Postgres/TypeORM las devuelve como
  // string (para no perder precisión), así que si el frontend reenvía el valor tal
  // cual lo recibió (editar sin tocar el campo), llega como string "350.00" y
  // @IsNumber() lo rechazaba. @Type(() => Number) lo convierte antes de validar.
  @ApiProperty({ example: 350.00 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precio: number

  @ApiProperty({ required: false, example: 299.90 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precioOferta?: number

  @ApiProperty({ required: false, example: 350.00, description: 'Precio 1 — uso flexible según agente' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precio1?: number

  @ApiProperty({ required: false, example: 330.00, description: 'Precio 2 — uso flexible según agente' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precio2?: number

  @ApiProperty({ required: false, example: 310.00, description: 'Precio 3 — uso flexible según agente' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precio3?: number

  @ApiProperty({ required: false, example: 'PEN', description: 'Código de moneda: PEN, USD, etc.' })
  @IsOptional()
  @IsString()
  moneda?: string

  @ApiProperty({ required: false, example: 15 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number

  @ApiProperty({ required: false, example: '2026-08-15', description: 'Fecha desde la que el producto está disponible para la venta. Vacío = disponible desde siempre.' })
  @IsOptional()
  @IsDateString()
  fechaDisponibilidad?: string

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
