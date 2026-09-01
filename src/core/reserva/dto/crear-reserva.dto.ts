import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator'

export class CrearReservaDto {
  @IsString()
  agenteId: string

  @IsString()
  tipo: string

  @IsOptional()
  @IsString()
  modalidad?: string

  @IsOptional()
  @IsString()
  contactoNombre?: string

  @IsOptional()
  @IsString()
  contactoTelefono?: string

  @IsOptional()
  contactoUbicacion?: {
    latitud?: number
    longitud?: number
    direccion?: string
    barrio?: string
  }

  @IsOptional()
  @IsNumber()
  cantidadValor?: number

  @IsOptional()
  @IsString()
  cantidadUnidad?: string

  @IsOptional()
  @IsNumber()
  precioUnitario?: number

  @IsOptional()
  @IsNumber()
  precioTotal?: number

  @IsOptional()
  @IsDateString()
  fechaReserva?: string

  @IsOptional()
  @IsString()
  horaReserva?: string

  @IsOptional()
  @IsNumber()
  duracionMinutos?: number

  @IsOptional()
  @IsString()
  prioridad?: string

  @IsOptional()
  @IsString()
  estado?: string

  @IsOptional()
  @IsString()
  notas?: string

  @IsOptional()
  @IsString()
  fotoUrl?: string

  @IsOptional()
  atributosCustom?: Record<string, any>

  @IsOptional()
  @IsString()
  conversacionId?: string
}
