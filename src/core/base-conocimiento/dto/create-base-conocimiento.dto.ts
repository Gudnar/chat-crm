import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateBaseConocimientoDto {
  @ApiProperty({ example: '¿Cuál es el horario de atención?' })
  @IsNotEmpty()
  @IsString()
  pregunta: string

  @ApiProperty({ example: 'Lunes a viernes de 9:00 a 18:00 hrs.' })
  @IsNotEmpty()
  @IsString()
  respuesta: string

  @ApiProperty({ required: false, example: 'Horarios' })
  @IsOptional()
  @IsString()
  categoria?: string

  @ApiProperty({ required: false, example: 0 })
  @IsOptional()
  @IsInt()
  orden?: number

  // Inyectado por el controller — no viene del body
  agenteId?: string
}

export class UpdateBaseConocimientoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pregunta?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  respuesta?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoria?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  orden?: number
}
