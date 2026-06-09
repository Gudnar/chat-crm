import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class SetConfiguracionClienteDto {
  @ApiProperty({ example: 'ANTHROPIC_API_KEY' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  clave: string

  @ApiProperty({ example: 'sk-ant-...' })
  @IsOptional()
  @IsString()
  valor?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  esSecreto?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  descripcion?: string
}
