import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator'

export class CreateCampanaDto {
  @ApiProperty() @IsNotEmpty() @IsString() nombre: string
  @ApiPropertyOptional() @IsOptional() @IsString() descripcion?: string
  @ApiProperty() @IsNotEmpty() @IsString() mensaje: string
  @ApiProperty({ enum: ['fijo', 'ia'] }) @IsIn(['fijo', 'ia']) tipoMensaje: string
  @ApiProperty() @IsDateString() programadoEn: string
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(100) scoreMin?: number
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(100) scoreMax?: number
  @ApiPropertyOptional() @IsOptional() @IsString() canalObjetivo?: string
}
