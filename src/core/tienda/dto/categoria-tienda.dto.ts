import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateCategoriaTiendaDto {
  @ApiProperty({ example: 'Pollo Broasted' })
  @IsNotEmpty()
  @IsString()
  nombre: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imagenUrl?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  orden?: number
}

export class UpdateCategoriaTiendaDto extends CreateCategoriaTiendaDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  nombre: string
}
