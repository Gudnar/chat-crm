import { IsNotEmpty, IsOptional, IsString, IsNumber, IsObject, IsBoolean } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CreateSucursalDto {
  @ApiProperty({ example: 'Sucursal La Paz' })
  @IsNotEmpty()
  @IsString()
  nombre: string

  @ApiProperty({ example: 'LPZ' })
  @IsNotEmpty()
  @IsString()
  codigo: string

  @ApiProperty({ required: false, example: 'Calle Principal 123' })
  @IsOptional()
  @IsString()
  direccion?: string

  @ApiProperty({ required: false, example: '+59123456789' })
  @IsOptional()
  @IsString()
  telefono?: string

  @ApiProperty({ required: false, example: -16.489733 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitud?: number

  @ApiProperty({ required: false, example: -68.119293 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitud?: number

  @ApiProperty({ required: false, example: { lunes: { inicio: '08:00', fin: '18:00' } } })
  @IsOptional()
  @IsObject()
  horarios?: Record<string, any>

  // ── Campos de tienda/ecommerce ──────────────────────
  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  aceptaPagoQr?: boolean

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  aceptaPagoEfectivo?: boolean

  @ApiProperty({ required: false, example: 'https://...' })
  @IsOptional()
  @IsString()
  qrImagenUrl?: string
}

export class UpdateSucursalDto extends CreateSucursalDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean

  @IsOptional()
  nombre: string

  @IsOptional()
  codigo: string
}
