import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class CreateServicioAgenteDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  agenteId: string

  @ApiProperty({ example: 'Consulta técnica' })
  @IsNotEmpty()
  @IsString()
  nombre: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string

  @ApiProperty({ example: 30, description: 'Duración en minutos' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  duracionMinutos: number

  @ApiProperty({ required: false, example: 150.0 })
  @IsOptional()
  @IsNumber()
  precio?: number

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean
}

export class UpdateServicioAgenteDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombre?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  duracionMinutos?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  precio?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean
}
