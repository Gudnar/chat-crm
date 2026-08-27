import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class AbrirCajaDto {
  @ApiProperty({ example: 500.00 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  montoApertura: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notas?: string
}

export class CerrarCajaDto {
  @ApiProperty({ example: 750.00 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  montoCierreDeclarado: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notas?: string
}
