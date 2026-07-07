import {
  Body, Controller, Delete, Get, Param, Post, Put,
  Query, Request, UploadedFile, UploadedFiles, UseGuards, UseInterceptors, Res,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { ProductoService } from '../service/producto.service'
import { CreateProductoDto, UpdateProductoDto } from '../dto/create-producto.dto'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'

const imagenesStorage = diskStorage({
  destination: join(process.cwd(), 'uploads', 'productos'),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${extname(file.originalname).toLowerCase()}`)
  },
})

const soloImagenes = (_req: any, file: Express.Multer.File, cb: any) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Solo se permiten archivos de imagen (jpg, png, webp, etc.)'), false)
  } else {
    cb(null, true)
  }
}

@ApiTags('Productos')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard)
@Controller('productos')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Get()
  async listar(
    @Query('q') q: string,
    @Query('categoria') categoria: string,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.productoService.listar(req.user.clienteId, q, categoria)
    return new SuccessResponseDto(datos)
  }

  @Get(':id')
  async obtener(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.productoService.obtener(id, req.user.clienteId)
    return new SuccessResponseDto(datos)
  }

  @Post()
  async crear(@Body() dto: CreateProductoDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.productoService.crear(dto, req.user.clienteId, req.user.id)
    return new SuccessResponseDto(datos, 'Producto creado correctamente')
  }

  @Put(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() dto: UpdateProductoDto,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.productoService.actualizar(id, dto, req.user.clienteId, req.user.id)
    return new SuccessResponseDto(datos, 'Producto actualizado correctamente')
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    await this.productoService.eliminar(id, req.user.clienteId, req.user.id)
    return new SuccessResponseDto(null, 'Producto eliminado correctamente')
  }

  // ── Gestión de imágenes ───────────────────────────────────────

  @Post(':id/imagenes')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('imagenes', 10, {
    storage: imagenesStorage,
    fileFilter: soloImagenes,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB por imagen
  }))
  async subirImagenes(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const filenames = files.map(f => `productos/${f.filename}`)
    const datos = await this.productoService.agregarImagenes(id, filenames, req.user.clienteId, req.user.id)
    return new SuccessResponseDto(datos, `${files.length} imagen(es) subida(s) correctamente`)
  }

  @Delete(':id/imagenes')
  async eliminarImagen(
    @Param('id') id: string,
    @Body('filename') filename: string,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    const datos = await this.productoService.eliminarImagen(id, filename, req.user.clienteId, req.user.id)
    return new SuccessResponseDto(datos, 'Imagen eliminada correctamente')
  }

  // ── Importar/Exportar Excel ───────────────────────────────────

  @Get('exportar/excel')
  async exportarExcel(@Request() req: any, @Res() res: Response): Promise<void> {
    const buffer = await this.productoService.exportarExcel(req.user.clienteId)
    const fecha = new Date().toISOString().split('T')[0]
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="productos-${fecha}.xlsx"`,
    })
    res.send(buffer)
  }

  @Post('importar/excel')
  @UseInterceptors(FileInterceptor('archivo'))
  async importarExcel(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ): Promise<SuccessResponseDto> {
    if (!file) {
      return new SuccessResponseDto(null, 'Archivo requerido')
    }
    const resultado = await this.productoService.importarExcel(file.buffer, req.user.clienteId, req.user.id)
    return new SuccessResponseDto(resultado, `Se importaron ${resultado.creados} productos`)
  }
}
