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

export class EnviarAdjuntoDto {
  @IsString() celular: string
  @IsString() url: string
  @IsString() tipo: string // 'image' | 'document' | 'audio'
  @IsOptional() @IsString() nombre?: string
  @IsOptional() @IsString() caption?: string
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
  interactive?: {
    type: string
    button_reply?: { id: string; title: string }
    list_reply?: { id: string; title: string }
    nfm_reply?: { name: string; body: string; response_json: string }
  }
  image?: { id: string; mime_type: string; sha256: string; caption?: string }
  audio?: { id: string; mime_type: string }
  document?: { id: string; filename: string; mime_type: string; caption?: string }
  location?: { latitude: number; longitude: number; name?: string; address?: string }
  // Presente solo en el PRIMER mensaje cuando el cliente llega desde un anuncio
  // Click-to-WhatsApp de Meta — lo agrega Meta automáticamente, no hay que pedirlo.
  referral?: {
    source_id?: string
    source_url?: string
    source_type?: string
    headline?: string
    body?: string
    media_type?: string
    ctwa_clid?: string
  }
}

export interface WaContact {
  profile: { name: string }
  wa_id: string
}
