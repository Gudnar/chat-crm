import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { CampoFlow } from '../entity/flow-whatsapp.entity'

const CATEGORIAS_FLOW = ['SIGN_UP', 'SIGN_IN', 'APPOINTMENT_BOOKING', 'LEAD_GENERATION', 'CONTACT_US', 'CUSTOMER_SUPPORT', 'SURVEY', 'OTHER']

export class CreateFlowWhatsappDto {
  @IsNotEmpty()
  @IsString()
  nombre: string

  @IsIn(CATEGORIAS_FLOW)
  categoria: string

  @IsOptional()
  @IsString()
  cta?: string

  @IsNotEmpty()
  @IsString()
  mensajeCuerpo: string

  @IsOptional()
  @IsString()
  screenTitle?: string

  @IsArray()
  campos: CampoFlow[]
}

export class UpdateFlowWhatsappDto {
  @IsOptional()
  @IsIn(CATEGORIAS_FLOW)
  categoria?: string

  @IsOptional()
  @IsString()
  cta?: string

  @IsOptional()
  @IsString()
  mensajeCuerpo?: string

  @IsOptional()
  @IsString()
  screenTitle?: string

  @IsOptional()
  @IsArray()
  campos?: CampoFlow[]
}
