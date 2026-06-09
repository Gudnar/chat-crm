import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateCuentaRedSocialDto {
  @IsNotEmpty()
  @IsString()
  plataforma!: string

  @IsNotEmpty()
  @IsString()
  nombre!: string

  @IsNotEmpty()
  @IsString()
  pageId!: string

  @IsOptional()
  @IsString()
  accessToken?: string

  @IsOptional()
  @IsString()
  appSecret?: string

  @IsOptional()
  @IsString()
  verifyToken?: string

  @IsOptional()
  @IsString()
  agenteId?: string

  @IsOptional()
  @IsBoolean()
  enabled?: boolean
}

export class UpdateCuentaRedSocialDto {
  @IsOptional()
  @IsString()
  nombre?: string

  @IsOptional()
  @IsString()
  pageId?: string

  @IsOptional()
  @IsString()
  accessToken?: string

  @IsOptional()
  @IsString()
  appSecret?: string

  @IsOptional()
  @IsString()
  verifyToken?: string

  @IsOptional()
  @IsString()
  agenteId?: string

  @IsOptional()
  @IsBoolean()
  enabled?: boolean
}

export class CreateRedSocialPostDto {
  @IsNotEmpty()
  @IsString()
  plataforma!: string

  @IsNotEmpty()
  @IsString()
  postId!: string

  @IsNotEmpty()
  @IsString()
  titulo!: string

  @IsOptional()
  @IsString()
  agenteId?: string

  @IsOptional()
  @IsString()
  cuentaId?: string

  @IsOptional()
  @IsBoolean()
  enabled?: boolean
}

export class UpdateRedSocialPostDto {
  @IsOptional()
  @IsString()
  titulo?: string

  @IsOptional()
  @IsString()
  postId?: string

  @IsOptional()
  @IsString()
  plataforma?: string

  @IsOptional()
  @IsString()
  agenteId?: string

  @IsOptional()
  @IsString()
  cuentaId?: string

  @IsOptional()
  @IsBoolean()
  enabled?: boolean
}

export class EnviarDMDto {
  @IsNotEmpty()
  @IsString()
  recipientId!: string

  @IsNotEmpty()
  @IsString()
  texto!: string

  @IsNotEmpty()
  @IsString()
  plataforma!: string // 'facebook' | 'instagram'
}

export class TestConexionMetaDto {
  @IsNotEmpty()
  @IsString()
  accessToken!: string

  @IsNotEmpty()
  @IsString()
  pageId!: string

  @IsNotEmpty()
  @IsString()
  plataforma!: string
}
