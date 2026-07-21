import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { mkdirSync } from 'fs'
import { ApiBearerAuth, ApiTags, ApiConsumes } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { RecursoService } from '../service/recurso.service'
import { CreateRecursoDto, UpdateRecursoDto } from '../dto/create-recurso.dto'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'
import { TipoRecurso } from '../entity/recurso.entity'
import { detectarTipo, mimesPermitidos, LIMITE_BYTES_GLOBAL } from '../recurso.constants'

/**
 * El archivo se guarda en uploads/recursos/{clienteId}/{tipo}/{archivo}, y el service
 * registra `archivoLocal = {tipo}/{archivo}`. Ambas rutas se derivan del MIME real
 * vía `detectarTipo`, de modo que el destino en disco y la URL pública siempre coinciden.
 */
const recursoStorage = diskStorage({
  destination: (req, file, cb) => {
    const clienteId = (req.user as any)?.clienteId
    if (!clienteId) {
      cb(new Error('Cliente no identificado'), '')
      return
    }
    const tipo = detectarTipo(file.mimetype)
    if (!tipo) {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), '')
      return
    }
    // multer no crea directorios: sin esto la primera subida falla con ENOENT
    const dir = join(process.cwd(), 'uploads', 'recursos', String(clienteId), tipo.toLowerCase())
    try {
      mkdirSync(dir, { recursive: true })
    } catch (err: any) {
      cb(err, '')
      return
    }
    cb(null, dir)
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${extname(file.originalname).toLowerCase()}`)
  },
})

/** Rechaza cualquier MIME fuera de la lista permitida (ej. .exe, .sh). */
const filtroRecurso = (_req: any, file: Express.Multer.File, cb: any) => {
  if (!detectarTipo(file.mimetype)) {
    cb(new BadRequestException(`Tipo de archivo no permitido: ${file.mimetype}. Permitidos: ${mimesPermitidos().join(', ')}`), false)
    return
  }
  cb(null, true)
}

@ApiTags('Recursos')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('recursos')
export class RecursoController {
  constructor(private readonly recursoService: RecursoService) {}

  @Get()
  async listar(
    @Query('tipo') tipo?: TipoRecurso,
    @Query('categoria') categoria?: string,
    @Query('activo') activo?: string,
    @Request() req?: any,
  ): Promise<SuccessResponseDto> {
    const filtros = {
      tipo,
      categoria,
      activo: activo === 'true' ? true : activo === 'false' ? false : undefined,
    }
    const datos = await this.recursoService.listar(req.user.clienteId, filtros)
    return new SuccessResponseDto(datos)
  }

  @Get('buscar/:keyword')
  async buscar(@Param('keyword') keyword: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.recursoService.buscarPorKeywords(req.user.clienteId, keyword)
    return new SuccessResponseDto(datos)
  }

  @Get('tipos')
  async obtenerTipos(): Promise<SuccessResponseDto> {
    const tipos = this.recursoService.obtenerTiposPermitidos()
    const mimes = this.recursoService.obtenerMimeTypesPermitidos()
    return new SuccessResponseDto({ tipos, mimes })
  }

  @Get(':id')
  async obtener(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.recursoService.obtener(id, req.user.clienteId)
    return new SuccessResponseDto(datos)
  }

  @Get(':id/url')
  async obtenerUrl(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const url = await this.recursoService.obtenerUrlPublica(id, req.user.clienteId)
    return new SuccessResponseDto({ url })
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  @UseInterceptors(FileInterceptor('archivo', {
    storage: recursoStorage,
    fileFilter: filtroRecurso,
    limits: { fileSize: LIMITE_BYTES_GLOBAL },
  }))
  @ApiConsumes('multipart/form-data')
  async crear(
    @Body() dto: CreateRecursoDto,
    @UploadedFile() archivo?: Express.Multer.File,
    @Request() req?: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.recursoService.crear(dto, archivo, req.user.id, req.user.clienteId)
    return new SuccessResponseDto(datos, 'Recurso creado exitosamente')
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateRecursoDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.recursoService.actualizar(id, dto, req.user.id, req.user.clienteId)
    return new SuccessResponseDto(datos, 'Recurso actualizado')
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  async eliminar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    await this.recursoService.eliminar(id, req.user.id, req.user.clienteId)
    return new SuccessResponseDto(null, 'Recurso eliminado')
  }
}
