import { IsArray, IsBoolean, IsEmail, IsIn, IsNotEmpty, IsObject, IsOptional, IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateAgenteHumanoDto {
  @ApiProperty({ example: 'Carlos' })
  @IsNotEmpty()
  @IsString()
  nombres: string

  @ApiProperty({ example: 'Mendoza', required: false })
  @IsOptional()
  @IsString()
  apellidos?: string

  @ApiProperty({ example: 'carlos.mendoza@empresa.com', required: false })
  @IsOptional()
  @IsEmail()
  correoElectronico?: string

  @ApiProperty({ example: 'carlos.mendoza', description: 'Usuario de acceso a la plataforma' })
  @IsNotEmpty()
  @IsString()
  usuario: string

  @ApiProperty({ description: 'Contraseña de acceso' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  contrasena: string

  @ApiProperty({ required: false, example: '👨‍💼' })
  @IsOptional()
  @IsString()
  avatar?: string

  @ApiProperty({ required: false, example: '#22c55e' })
  @IsOptional()
  @IsString()
  color?: string

  @ApiProperty({ required: false, example: ['ventas', 'soporte técnico'] })
  @IsOptional()
  @IsArray()
  especialidades?: string[]

  @ApiProperty({ required: false, description: 'Horario laboral por día', example: { lunes: { inicio: '09:00', fin: '18:00' } } })
  @IsOptional()
  @IsObject()
  horasTrabajo?: Record<string, { inicio: string; fin: string }>

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string
}

export class UpdateAgenteHumanoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombres?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  apellidos?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  correoElectronico?: string

  @ApiProperty({ required: false, description: 'Nueva contraseña (opcional)' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  contrasena?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatar?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  color?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  especialidades?: string[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  horasTrabajo?: Record<string, { inicio: string; fin: string }>

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean
}

export class CambiarDisponibilidadDto {
  @ApiProperty({ example: 'disponible', enum: ['inactivo', 'disponible', 'ocupado', 'ausente'] })
  @IsNotEmpty()
  @IsIn(['inactivo', 'disponible', 'ocupado', 'ausente'])
  estado: string
}

export class AsignarConversacionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  conversacionId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  agenteHumanoId: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  razon?: string

  @ApiProperty({ required: false, description: 'true si proviene de una escalada desde IA' })
  @IsOptional()
  @IsBoolean()
  esEscalada?: boolean
}

export class CerrarConversacionDto {
  @ApiProperty({ required: false, example: 'Cliente satisfecho con la solución' })
  @IsOptional()
  @IsString()
  resolucion?: string
}
