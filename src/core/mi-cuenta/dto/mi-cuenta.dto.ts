import { IsString, IsOptional, IsEmail, MinLength, IsArray, IsIn, IsObject, IsBoolean } from 'class-validator'

export class UpdateMiCuentaDto {
  @IsOptional() @IsString() nombre?: string
  @IsOptional() @IsString() logoUrl?: string
  @IsOptional() @IsEmail() correoContacto?: string
  @IsOptional() @IsString() telefono?: string
  @IsOptional() @IsArray() diasAtencion?: string[]
  @IsOptional() @IsString() horaInicioAtencion?: string
  @IsOptional() @IsString() horaFinAtencion?: string
  @IsOptional() @IsArray() servicios?: string[]
  @IsOptional() @IsArray() horarios?: { dia: string; franjas: { inicio: string; fin: string }[] }[]
}

export class CreateUsuarioClienteDto {
  @IsString() usuario: string
  @IsString() @MinLength(6) contrasena: string
  @IsString() nombres: string
  @IsOptional() @IsString() apellidos?: string
  @IsOptional() @IsEmail() correoElectronico?: string
  @IsOptional() @IsIn(['ADMIN_CLIENTE', 'COLABORADOR']) rol?: string
  @IsOptional() @IsString() rolClienteId?: string
}

export class UpdateUsuarioClienteDto {
  @IsOptional() @IsString() nombres?: string
  @IsOptional() @IsString() apellidos?: string
  @IsOptional() @IsEmail() correoElectronico?: string
  @IsOptional() @IsIn(['ADMIN_CLIENTE', 'COLABORADOR']) rol?: string
  @IsOptional() @IsString() @MinLength(6) contrasena?: string
  @IsOptional() @IsString() rolClienteId?: string
}

export class CreateRolClienteDto {
  @IsString() nombre: string
  @IsOptional() @IsString() descripcion?: string
  @IsOptional() @IsObject() permisos?: Record<string, Record<string, boolean>>
}

export class UpdateRolClienteDto {
  @IsOptional() @IsString() nombre?: string
  @IsOptional() @IsString() descripcion?: string
  @IsOptional() @IsObject() permisos?: Record<string, Record<string, boolean>>
}
