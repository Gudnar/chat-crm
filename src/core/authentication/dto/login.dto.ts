import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({ example: 'admin' })
  @IsNotEmpty()
  @IsString()
  usuario: string

  @ApiProperty({ example: 'UGFzc3dvcmQxMjMh' })
  @IsNotEmpty()
  @IsString()
  contrasena: string
}
