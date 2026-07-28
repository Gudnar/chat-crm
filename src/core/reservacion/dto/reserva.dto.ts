import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator'
import { EstadoReserva } from '../../../common/constants'

export class CreateReservaDto {
  @ApiProperty({ description: 'Agente (IA o humano) con el que se reserva' })
  @IsNotEmpty()
  @IsString()
  agenteId: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  servicioAgenteId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  conversacionId?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  contactoNombre: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contactoTelefono?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contactoEmail?: string

  @ApiProperty({ description: 'Fecha y hora de inicio en formato ISO 8601', example: '2026-07-28T14:30:00-04:00' })
  @IsNotEmpty()
  @IsDateString()
  fechaInicio: string

  @ApiProperty({ required: false, description: 'Si no se indica, se toma del servicioAgente o se usa 30 por defecto' })
  @IsOptional()
  @IsInt()
  @Min(1)
  duracionMinutos?: number

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  titulo: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tipoServicio?: string
}

export class UpdateReservaDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  duracionMinutos?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  titulo?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notasInternas?: string
}

export class ActualizarEstadoReservaDto {
  @ApiProperty({ enum: Object.values(EstadoReserva) })
  @IsNotEmpty()
  @IsIn(Object.values(EstadoReserva))
  estado: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resultado?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notasInternas?: string
}
