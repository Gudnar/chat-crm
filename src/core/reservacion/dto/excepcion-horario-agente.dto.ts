import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

const TIPOS_EXCEPCION = ['feriado', 'vacacion', 'aniversario', 'otro']

export class CreateExcepcionHorarioAgenteDto {
  @ApiProperty({ required: false, description: 'Vacío/ausente = bloquea a todo el equipo humano del cliente' })
  @IsOptional()
  @IsString()
  agenteId?: string

  @ApiProperty({ example: '2026-12-25' })
  @IsNotEmpty()
  @IsDateString()
  fechaInicio: string

  @ApiProperty({ example: '2026-12-25' })
  @IsNotEmpty()
  @IsDateString()
  fechaFin: string

  @ApiProperty({ example: 'Feriado nacional' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  motivo: string

  @ApiProperty({ required: false, enum: TIPOS_EXCEPCION })
  @IsOptional()
  @IsIn(TIPOS_EXCEPCION)
  tipo?: string
}

export class UpdateExcepcionHorarioAgenteDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  agenteId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fechaFin?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  motivo?: string

  @ApiProperty({ required: false, enum: TIPOS_EXCEPCION })
  @IsOptional()
  @IsIn(TIPOS_EXCEPCION)
  tipo?: string
}
