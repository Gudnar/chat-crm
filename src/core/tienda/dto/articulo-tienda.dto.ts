import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { GrupoOpcionesTienda } from '../entity/articulo-tienda.entity'

export class CreateArticuloTiendaDto {
  @ApiProperty({ example: 'Vestido Corte A' })
  @IsNotEmpty()
  @IsString()
  nombre: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string

  @ApiProperty({ required: false, example: 'Pollo Leña & Broasted' })
  @IsOptional()
  @IsString()
  categoria?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imagenUrl?: string

  @ApiProperty({ example: 38 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precio: number

  @ApiProperty({ required: false, example: 'Bs' })
  @IsOptional()
  @IsString()
  moneda?: string

  @ApiProperty({ required: false, type: [Object] })
  @IsOptional()
  @IsArray()
  gruposOpciones?: GrupoOpcionesTienda[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  orden?: number
}

export class UpdateArticuloTiendaDto extends CreateArticuloTiendaDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  nombre: string

  @ApiProperty({ required: false })
  @IsOptional()
  precio: number
}
