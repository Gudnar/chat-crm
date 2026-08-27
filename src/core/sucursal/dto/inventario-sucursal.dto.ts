import { IsNotEmpty, IsOptional, IsInt, Min, IsBoolean } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CreateInventarioSucursalDto {
  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  @Type(() => String)
  productoId: string

  @ApiProperty({ required: false, example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number

  @ApiProperty({ required: false, example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockMinimo?: number
}

export class UpdateInventarioSucursalDto {
  @ApiProperty({ required: false, example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number

  @ApiProperty({ required: false, example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockMinimo?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean
}

export class AjustarStockDto {
  @ApiProperty({ example: 5 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad: number
}
