import { IsArray, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class OpcionSeleccionadaDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  grupoId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  opcionId: string
}

export class AgregarItemCarritoDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  articuloId: string

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  cantidad?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notas?: string

  /** Solo los IDs elegidos — el nombre/precio de cada opción se resuelve server-side contra el catálogo real, nunca se confía en lo que mande el cliente. */
  @ApiProperty({ required: false, type: [OpcionSeleccionadaDto] })
  @IsOptional()
  @IsArray()
  opcionesSeleccionadas?: OpcionSeleccionadaDto[]
}

export class ActualizarItemCarritoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  cantidad?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notas?: string

  @ApiProperty({ required: false, type: [OpcionSeleccionadaDto] })
  @IsOptional()
  @IsArray()
  opcionesSeleccionadas?: OpcionSeleccionadaDto[]
}

export class ElegirSucursalDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sucursalId: string
}

export class ConfirmarPedidoDto {
  @ApiProperty({ required: false, enum: ['qr', 'efectivo'] })
  @IsOptional()
  @IsIn(['qr', 'efectivo'])
  metodoPago?: string
}
