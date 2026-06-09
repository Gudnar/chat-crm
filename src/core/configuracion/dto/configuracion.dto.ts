import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class SetConfiguracionDto {
  @ApiProperty({ example: 'ANTHROPIC_API_KEY' })
  @IsNotEmpty()
  @IsString()
  clave: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  valor?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  esSecreto?: boolean
}

export class VerificarApiKeyDto {
  @ApiProperty({ example: 'sk-ant-api03-...' })
  @IsNotEmpty()
  @IsString()
  apiKey: string

  @ApiProperty({ example: 'claude-haiku-4-5', required: false })
  @IsOptional()
  @IsString()
  modelo?: string
}
