import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateClienteDto {
  @ApiProperty({ example: 'MiDoc' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  nombre: string

  @ApiProperty({ example: 'midoc', description: 'Identificador URL-safe, solo letras, números y guiones' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, { message: 'El slug solo puede contener letras minúsculas, números y guiones' })
  slug: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string

  @ApiProperty({ required: false, example: 'contacto@midoc.com' })
  @IsOptional()
  @IsEmail()
  correoContacto?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string

  @ApiProperty({ required: false, example: 'basico', enum: ['basico', 'profesional', 'enterprise'] })
  @IsOptional()
  @IsString()
  plan?: string

  @ApiProperty({ required: false, example: ['lunes', 'martes', 'miercoles'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  diasAtencion?: string[]

  @ApiProperty({ required: false, example: '08:00' })
  @IsOptional()
  @IsString()
  horaInicioAtencion?: string

  @ApiProperty({ required: false, example: '18:00' })
  @IsOptional()
  @IsString()
  horaFinAtencion?: string

  @ApiProperty({ required: false, example: ['Consulta médica', 'Urgencias'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  servicios?: string[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  horarios?: { dia: string; franjas: { inicio: string; fin: string }[] }[]
}

export class UpdateClienteDto extends CreateClienteDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean
}
