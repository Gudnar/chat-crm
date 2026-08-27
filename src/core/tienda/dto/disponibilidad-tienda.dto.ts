import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class DisponibilidadSucursalDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sucursalId: string

  @ApiProperty()
  @IsBoolean()
  activo: boolean

  @ApiProperty({ required: false, description: 'null/omitido = sin control de stock (ilimitado)' })
  @IsOptional()
  @IsInt()
  stock?: number | null
}
