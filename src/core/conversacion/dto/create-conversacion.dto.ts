import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateConversacionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  agenteId: string

  @ApiProperty({ example: 'Roberto Méndez' })
  @IsNotEmpty()
  @IsString()
  contacto: string

  @ApiProperty({ example: 'whatsapp', required: false })
  @IsOptional()
  @IsString()
  canal?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  etiquetas?: string[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notas?: string
}

export class AgregarMensajeDto {
  @ApiProperty({ example: 'user' })
  @IsNotEmpty()
  @IsString()
  role: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string
}

export class TestAgenteDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  agenteId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  mensaje: string

  @ApiProperty({ type: [Object], required: false })
  @IsOptional()
  @IsArray()
  historial?: Array<{ role: string; content: string }>
}
