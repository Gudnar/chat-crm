import { IsOptional, IsString, IsDateString, IsArray } from 'class-validator'

export class FiltroExportacionDto {
  @IsOptional()
  @IsString()
  agenteId?: string

  @IsOptional()
  @IsString()
  tipo?: string

  @IsOptional()
  @IsDateString()
  fechaDesde?: string

  @IsOptional()
  @IsDateString()
  fechaHasta?: string

  @IsOptional()
  @IsArray()
  estados?: string[]

  @IsOptional()
  @IsArray()
  modalidades?: string[]

  @IsOptional()
  @IsString()
  ordenarPor?: string // "fecha_reserva", "hora_reserva", "prioridad", etc.

  @IsOptional()
  @IsArray()
  incluirColumnas?: string[]
}
