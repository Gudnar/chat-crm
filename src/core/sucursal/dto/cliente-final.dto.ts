import { IsNotEmpty, IsOptional, IsString, IsArray, IsObject } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CreateClienteFinalDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsNotEmpty()
  @IsString()
  nombre: string

  @ApiProperty({ example: '+59123456789' })
  @IsNotEmpty()
  @IsString()
  telefono: string

  @ApiProperty({ required: false, example: '1' })
  @IsOptional()
  @Type(() => String)
  sucursalId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  direcciones?: Array<{
    id?: string
    nombre?: string
    direccion: string
    latitud?: number
    longitud?: number
    activa?: boolean
  }>

  @ApiProperty({ required: false, example: 'Cliente regular' })
  @IsOptional()
  @IsString()
  notas?: string
}

export class UpdateClienteFinalDto extends CreateClienteFinalDto {
  @IsOptional()
  nombre: string

  @IsOptional()
  telefono: string
}
