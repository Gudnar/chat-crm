import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class WhatsappConfigDto {
  @IsOptional() @IsString()  accessToken?:   string
  @IsOptional() @IsString()  phoneNumberId?: string
  @IsOptional() @IsString()  wabaId?:        string
  @IsOptional() @IsString()  verifyToken?:   string
  @IsOptional() @IsString()  agenteId?:      string
  @IsOptional() @IsBoolean() enabled?:       boolean
}

export class EnviarMensajeDto {
  @IsString() celular: string
  @IsString() mensaje: string
}

export class TestConexionDto {
  @IsString() accessToken:   string
  @IsString() phoneNumberId: string
}

// Shape of a Meta webhook payload message entry
export interface WaWebhookMessage {
  id: string
  from: string
  timestamp: string
  type: string
  text?: { body: string }
  button?: { payload: string; text: string }
  interactive?: { type: string; button_reply?: { id: string; title: string }; list_reply?: { id: string; title: string } }
  image?: { id: string; mime_type: string; sha256: string }
  audio?: { id: string; mime_type: string }
  document?: { id: string; filename: string; mime_type: string }
}

export interface WaContact {
  profile: { name: string }
  wa_id: string
}
