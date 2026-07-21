import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { TipoRecurso } from '../entity/recurso.entity'

/**
 * OJO: estos endpoints reciben multipart/form-data, donde TODO llega como string.
 * Por eso `keywords` se acepta como string (el service la normaliza a array) y
 * `activo` se transforma explícitamente a boolean.
 *
 * Además el ValidationPipe global usa `whitelist: true`: una propiedad sin
 * decoradores se descarta silenciosamente. Todo campo que deba llegar al service
 * necesita su decorador aquí.
 */
export class CreateRecursoDto {
  @ApiProperty({ example: 'Catálogo Garanted 2026' })
  @IsNotEmpty()
  @IsString()
  nombre: string

  @ApiProperty({ required: false, enum: TipoRecurso, description: 'Se deduce del archivo; solo obligatorio con urlExterna' })
  @IsOptional()
  @IsEnum(TipoRecurso)
  tipo?: TipoRecurso

  @ApiProperty({ required: false, example: 'catalogo' })
  @IsOptional()
  @IsString()
  categoria?: string

  @ApiProperty({ required: false, example: 'catalogo,precios,productos', description: 'CSV o JSON array' })
  @IsOptional()
  keywords?: string[] | string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  agenteId?: string

  @ApiProperty({ required: false, description: 'Si el archivo está hospedado fuera' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  urlExterna?: string
}

export class UpdateRecursoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombre?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoria?: string

  @ApiProperty({ required: false })
  @IsOptional()
  keywords?: string[] | string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  agenteId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl({ require_tld: false })
  urlExterna?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  activo?: boolean
}
