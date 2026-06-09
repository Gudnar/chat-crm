import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateUsuarioDto {
  @ApiProperty({ example: 'admin' })
  @IsNotEmpty()
  @IsString()
  usuario: string

  @ApiProperty({ example: 'Password123!' })
  @IsNotEmpty()
  @MinLength(6)
  contrasena: string

  @ApiProperty({ example: 'Admin' })
  @IsNotEmpty()
  @IsString()
  nombres: string

  @ApiProperty({ example: 'Sistema', required: false })
  @IsOptional()
  @IsString()
  apellidos?: string

  @ApiProperty({ example: 'admin@empresa.com', required: false })
  @IsOptional()
  @IsEmail()
  correoElectronico?: string

  @ApiProperty({ example: 'ADMIN', required: false })
  @IsOptional()
  @IsString()
  rol?: string
}
