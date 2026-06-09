import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateAgenteDto {
  @ApiProperty({ example: 'Sofía' })
  @IsNotEmpty()
  @IsString()
  nombre: string

  @ApiProperty({ example: 'Agente de ventas y soporte', required: false })
  @IsOptional()
  @IsString()
  descripcion?: string

  @ApiProperty({ example: 'claude-haiku-4-5', required: false })
  @IsOptional()
  @IsString()
  modelo?: string

  @ApiProperty({ example: 'profesional', required: false })
  @IsOptional()
  @IsString()
  tono?: string

  @ApiProperty({ example: 'español', required: false })
  @IsOptional()
  @IsString()
  idioma?: string

  @ApiProperty({ example: 256, required: false })
  @IsOptional()
  @IsInt()
  @Min(64)
  @Max(4096)
  maxTokens?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  systemPrompt?: string

  @ApiProperty({ example: 'hybrid', required: false })
  @IsOptional()
  @IsString()
  modoOperacion?: string

  @ApiProperty({ example: '✦', required: false })
  @IsOptional()
  @IsString()
  avatar?: string

  @ApiProperty({ example: '#6366f1', required: false })
  @IsOptional()
  @IsString()
  color?: string
}

export class UpdateAgenteDto extends CreateAgenteDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean
}
