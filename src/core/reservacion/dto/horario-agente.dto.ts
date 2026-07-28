import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsString, Matches, Max, Min } from 'class-validator'

const HORA_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/

export class CreateHorarioAgenteDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  agenteId: string

  @ApiProperty({ example: 1, description: '0 = domingo, 1 = lunes, ..., 6 = sábado' })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(6)
  diaSemana: number

  @ApiProperty({ example: '08:00' })
  @IsNotEmpty()
  @Matches(HORA_REGEX, { message: 'horaInicio debe tener formato HH:mm' })
  horaInicio: string

  @ApiProperty({ example: '10:00' })
  @IsNotEmpty()
  @Matches(HORA_REGEX, { message: 'horaFin debe tener formato HH:mm' })
  horaFin: string
}
