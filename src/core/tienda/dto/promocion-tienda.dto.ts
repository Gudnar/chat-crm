import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class CreatePromocionTiendaDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  articuloId: string

  @ApiProperty({ required: false, description: 'Sin valor = aplica en todas las sucursales' })
  @IsOptional()
  @IsString()
  sucursalId?: string

  @ApiProperty({ example: 29.9 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precioPromocional: number

  @ApiProperty({ example: '2026-08-20T00:00' })
  @IsNotEmpty()
  @IsString()
  fechaInicio: string

  @ApiProperty({ example: '2026-08-27T23:59' })
  @IsNotEmpty()
  @IsString()
  fechaFin: string
}

export class UpdatePromocionTiendaDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sucursalId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precioPromocional?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fechaInicio?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fechaFin?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean
}
