import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsNotEmpty } from 'class-validator'

export class ActualizarTemaDto {
  @ApiProperty({ example: 'light', enum: ['dark', 'light'] })
  @IsNotEmpty()
  @IsIn(['dark', 'light'])
  tema: string
}
