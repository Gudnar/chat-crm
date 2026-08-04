import { IsIn, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'
import { ComponentesPlantilla } from '../entity/plantilla-whatsapp.entity'

export class CreatePlantillaWhatsappDto {
  @IsNotEmpty()
  @IsString()
  nombre: string

  @IsOptional()
  @IsString()
  idioma?: string

  @IsIn(['MARKETING', 'UTILITY', 'AUTHENTICATION'])
  categoria: string

  @IsObject()
  componentes: ComponentesPlantilla
}

export class EnviarPlantillaDto {
  @IsString() celular: string
  @IsString() plantillaId: string
  @IsOptional() parametros?: string[]
}
