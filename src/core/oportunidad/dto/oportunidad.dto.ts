import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator'
import { EstadoOportunidad, OrigenOportunidad } from '../../../common/constants'

export class CreateOportunidadDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  contactoNombre: string

  @ApiPropertyOptional({ example: '+59171234567' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactoTelefono?: string

  @ApiPropertyOptional({ example: 'juan@empresa.com' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  contactoEmail?: string

  @ApiPropertyOptional({ example: 'Importadora Andina SRL' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  empresa?: string

  @ApiPropertyOptional({ enum: Object.values(OrigenOportunidad), default: 'otro' })
  @IsOptional()
  @IsIn(Object.values(OrigenOportunidad))
  origen?: string

  @ApiPropertyOptional({ example: 'TOYOTA BZ5 2025 Pro 550' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  productoInteres?: string

  @ApiPropertyOptional({ example: 33963 })
  @IsOptional()
  @IsNumber()
  montoEstimado?: number

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  moneda?: string

  @ApiPropertyOptional({ enum: ['baja', 'media', 'alta'], default: 'media' })
  @IsOptional()
  @IsIn(['baja', 'media', 'alta'])
  prioridad?: string

  @ApiPropertyOptional({ description: 'Conversación del chat vinculada' })
  @IsOptional()
  @IsString()
  conversacionId?: string

  @ApiPropertyOptional({ description: 'Usuario responsable del seguimiento' })
  @IsOptional()
  @IsString()
  asignadoA?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notas?: string
}

export class UpdateOportunidadDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  contactoNombre?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactoTelefono?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  contactoEmail?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  empresa?: string

  @ApiPropertyOptional({ enum: Object.values(OrigenOportunidad) })
  @IsOptional()
  @IsIn(Object.values(OrigenOportunidad))
  origen?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  productoInteres?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  montoEstimado?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  moneda?: string

  @ApiPropertyOptional({ enum: ['baja', 'media', 'alta'] })
  @IsOptional()
  @IsIn(['baja', 'media', 'alta'])
  prioridad?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notas?: string
}

export class CambiarEstadoOportunidadDto {
  @ApiProperty({ enum: Object.values(EstadoOportunidad) })
  @IsIn(Object.values(EstadoOportunidad))
  estado: string

  @ApiPropertyOptional({ description: 'Obligatorio al pasar a perdida o cancelada' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string
}

export class RegistrarSeguimientoDto {
  @ApiProperty({ example: 'Se llamó al cliente, pidió la cotización por correo' })
  @IsString()
  @IsNotEmpty()
  nota: string

  @ApiPropertyOptional({ example: 'Enviar cotización por correo' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  proximaAccion?: string

  @ApiPropertyOptional({ example: '2026-07-10T15:00:00Z' })
  @IsOptional()
  @IsString()
  proximaAccionFecha?: string
}

export class AsignarOportunidadDto {
  @ApiProperty({ description: 'Id del usuario responsable' })
  @IsString()
  @IsNotEmpty()
  usuarioId: string
}
