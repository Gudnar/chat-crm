import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateHerramientaDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  agenteId: string

  @ApiProperty({ example: 'calificar_lead' })
  @IsNotEmpty()
  @IsString()
  nombre: string

  @ApiProperty({ example: 'Calificar Lead' })
  @IsNotEmpty()
  @IsString()
  label: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  descripcion: string

  @ApiProperty({ type: [String], example: ['score: number (0-100)', 'razon: string'] })
  @IsOptional()
  parametros?: string[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activa?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  autoConfirmar?: boolean

  @ApiProperty({ example: 70, required: false })
  @IsOptional()
  @IsInt()
  @Min(40)
  @Max(99)
  confianzaMinima?: number

  @ApiProperty({ example: '#f59e0b', required: false })
  @IsOptional()
  @IsString()
  color?: string

  @ApiProperty({ example: 'qualify', required: false })
  @IsOptional()
  @IsString()
  icono?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ejemplo?: string
}

export class UpdateHerramientaDto extends CreateHerramientaDto {}
