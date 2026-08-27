import { IsArray, IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateConversacionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  agenteId: string

  @ApiProperty({ example: 'Roberto Méndez' })
  @IsNotEmpty()
  @IsString()
  contacto: string

  @ApiProperty({ example: 'whatsapp', required: false })
  @IsOptional()
  @IsString()
  canal?: string

  @ApiProperty({ example: 'meta_ads', required: false, description: 'Origen del tráfico: meta_ads (automático) o un tag manual (ig_bio, website, etc.)' })
  @IsOptional()
  @IsString()
  origenFuente?: string

  @ApiProperty({ required: false, description: 'source_id del anuncio de Meta, solo cuando origenFuente es meta_ads' })
  @IsOptional()
  @IsString()
  origenRefId?: string

  @ApiProperty({ required: false, description: 'Datos crudos del origen (headline/body/ctwaClid del anuncio, etc.)' })
  @IsOptional()
  @IsObject()
  origenDetalle?: Record<string, any>

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  etiquetas?: string[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notas?: string
}

export class AgregarMensajeDto {
  @ApiProperty({ example: 'user' })
  @IsNotEmpty()
  @IsString()
  role: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string

  @ApiProperty({ required: false, description: 'Adjunto recibido/enviado (imagen, documento, audio)' })
  @IsOptional()
  @IsObject()
  adjunto?: { url: string; tipo: string; nombre?: string }

  @ApiProperty({ required: false, description: 'Pregunta con botones/lista enviada al cliente' })
  @IsOptional()
  @IsObject()
  interactivo?: { pregunta: string; botones: Array<{ id: string; titulo: string }> }

  @ApiProperty({ required: false, description: 'Botón con link externo enviado al cliente' })
  @IsOptional()
  @IsObject()
  enlace?: { texto: string; url: string }

  @ApiProperty({ required: false, description: 'Marca que este mensaje pidió la ubicación del cliente' })
  @IsOptional()
  @IsBoolean()
  pidioUbicacion?: boolean

  @ApiProperty({ required: false, description: 'Ubicación real compartida por el cliente' })
  @IsOptional()
  @IsObject()
  ubicacion?: { latitud: number; longitud: number; nombre?: string; direccion?: string }

  @ApiProperty({ required: false, description: 'Formulario (Flow) enviado al cliente' })
  @IsOptional()
  @IsObject()
  flow?: { metaFlowId: string; flowToken: string; cta: string }

  @ApiProperty({ required: false, description: 'Respuesta del formulario (Flow) completada por el cliente' })
  @IsOptional()
  @IsObject()
  respuestaFlow?: { nombre: string; respuestas: Record<string, string> }
}

export class TestAgenteDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  agenteId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  mensaje: string

  @ApiProperty({ type: [Object], required: false })
  @IsOptional()
  @IsArray()
  historial?: Array<{ role: string; content: string }>
}
