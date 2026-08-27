import {
  BadRequestException, Body, Controller, Delete, Get, Param, Post, Put,
  Request, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { memoryStorage } from 'multer'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { RolesGuard } from '../../authentication/guards/roles.guard'
import { Roles } from '../../authentication/decorators/roles.decorator'
import { TiendaService } from '../service/tienda.service'
import { PromocionTiendaService } from '../service/promocion-tienda.service'
import { CreateArticuloTiendaDto, UpdateArticuloTiendaDto } from '../dto/articulo-tienda.dto'
import { CreateCategoriaTiendaDto, UpdateCategoriaTiendaDto } from '../dto/categoria-tienda.dto'
import { CreatePromocionTiendaDto, UpdatePromocionTiendaDto } from '../dto/promocion-tienda.dto'
import { DisponibilidadSucursalDto } from '../dto/disponibilidad-tienda.dto'
import { ClienteService } from '../../cliente/service/cliente.service'
import { SucursalService } from '../../sucursal/service/sucursal.service'
import { CreateSucursalDto, UpdateSucursalDto } from '../../sucursal/dto/create-sucursal.dto'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'

const imagenMemoria = memoryStorage()

const soloImagenes = (_req: any, file: Express.Multer.File, cb: any) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Solo se permiten archivos de imagen (jpg, png, webp, etc.)'), false)
  } else {
    cb(null, true)
  }
}

/** SUPER_ADMIN (sin cliente propio) debe pasar ?clienteId=; el resto usa el de su sesión. */
function clienteIdDe(req: any): string {
  const deSesion = req.user?.clienteId
  if (deSesion) return String(deSesion)
  const deQuery = req.query?.clienteId
  if (deQuery) return String(deQuery)
  throw new BadRequestException('Debes indicar el cliente a administrar (parametro clienteId)')
}

@ApiTags('Tienda online')
@ApiBearerAuth('defaultBearerAuth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN_CLIENTE', 'COLABORADOR')
@Controller('tienda')
export class TiendaController {
  constructor(
    private readonly tiendaService: TiendaService,
    private readonly promocionService: PromocionTiendaService,
    private readonly sucursalService: SucursalService,
    private readonly clienteService: ClienteService,
  ) {}

  // ── Sucursales (rutas literales — antes de :id) ──

  @Get('sucursales')
  async listarSucursales(@Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.sucursalService.listar(clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  @Post('sucursales')
  async crearSucursal(@Body() dto: CreateSucursalDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.sucursalService.crear(dto, clienteIdDe(req), req.user.id)
    return new SuccessResponseDto(datos, 'Sucursal creada correctamente')
  }

  @Put('sucursales/:id')
  async actualizarSucursal(@Param('id') id: string, @Body() dto: UpdateSucursalDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.sucursalService.actualizar(id, dto, clienteIdDe(req), req.user.id)
    return new SuccessResponseDto(datos, 'Sucursal actualizada correctamente')
  }

  @Delete('sucursales/:id')
  async eliminarSucursal(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    await this.sucursalService.eliminar(id, clienteIdDe(req), req.user.id)
    return new SuccessResponseDto(null, 'Sucursal eliminada correctamente')
  }

  @Post('sucursales/:id/qr')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('imagen', { storage: imagenMemoria, fileFilter: soloImagenes, limits: { fileSize: 5 * 1024 * 1024 } }))
  async subirQrSucursal(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Request() req: any): Promise<SuccessResponseDto> {
    if (!file) throw new BadRequestException('Archivo requerido')
    const url = await this.tiendaService.guardarImagenProcesada(file.buffer, 'qr')
    const datos = await this.sucursalService.setImagenQr(id, url, clienteIdDe(req), req.user.id)
    return new SuccessResponseDto(datos, 'QR subido correctamente')
  }

  // ── Categorías (rutas literales — deben ir ANTES de :id para no colisionar) ──

  @Get('categorias')
  async listarCategorias(@Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.tiendaService.listarCategorias(clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  @Post('categorias')
  async crearCategoria(@Body() dto: CreateCategoriaTiendaDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.tiendaService.crearCategoria(dto, clienteIdDe(req), req.user.id)
    return new SuccessResponseDto(datos, 'Categoría creada correctamente')
  }

  @Put('categorias/:id')
  async actualizarCategoria(@Param('id') id: string, @Body() dto: UpdateCategoriaTiendaDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.tiendaService.actualizarCategoria(id, dto, clienteIdDe(req), req.user.id)
    return new SuccessResponseDto(datos, 'Categoría actualizada correctamente')
  }

  @Delete('categorias/:id')
  async eliminarCategoria(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    await this.tiendaService.eliminarCategoria(id, clienteIdDe(req), req.user.id)
    return new SuccessResponseDto(null, 'Categoría eliminada correctamente')
  }

  @Post('categorias/:id/imagen')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('imagen', { storage: imagenMemoria, fileFilter: soloImagenes, limits: { fileSize: 5 * 1024 * 1024 } }))
  async subirImagenCategoria(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Request() req: any): Promise<SuccessResponseDto> {
    if (!file) throw new BadRequestException('Archivo requerido')
    const url = await this.tiendaService.guardarImagenProcesada(file.buffer, 'categoria')
    const datos = await this.tiendaService.setImagenCategoria(id, url, clienteIdDe(req), req.user.id)
    return new SuccessResponseDto(datos, 'Imagen de categoría subida correctamente')
  }

  // ── Promociones (rutas literales — antes de :id) ──

  @Get('promociones')
  async listarPromociones(@Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.promocionService.listar(clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  @Post('promociones')
  async crearPromocion(@Body() dto: CreatePromocionTiendaDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.promocionService.crear(dto, clienteIdDe(req), req.user.id)
    return new SuccessResponseDto(datos, 'Promoción creada correctamente')
  }

  @Put('promociones/:id')
  async actualizarPromocion(@Param('id') id: string, @Body() dto: UpdatePromocionTiendaDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.promocionService.actualizar(id, dto, clienteIdDe(req), req.user.id)
    return new SuccessResponseDto(datos, 'Promoción actualizada correctamente')
  }

  @Delete('promociones/:id')
  async eliminarPromocion(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    await this.promocionService.eliminar(id, clienteIdDe(req), req.user.id)
    return new SuccessResponseDto(null, 'Promoción eliminada correctamente')
  }

  // ── Portada de la tienda (vive en Cliente, no en un artículo) ──

  @Post('portada/:clienteId')
  @Roles('SUPER_ADMIN', 'ADMIN_CLIENTE')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('imagen', { storage: imagenMemoria, fileFilter: soloImagenes, limits: { fileSize: 5 * 1024 * 1024 } }))
  async subirPortada(@Param('clienteId') clienteId: string, @UploadedFile() file: Express.Multer.File, @Request() req: any): Promise<SuccessResponseDto> {
    if (!file) throw new BadRequestException('Archivo requerido')
    const url = await this.tiendaService.guardarImagenProcesada(file.buffer, 'banner')
    const datos = await this.clienteService.actualizar(clienteId, { tiendaPortadaUrl: url } as any, req.user.id)
    return new SuccessResponseDto(datos, 'Portada actualizada correctamente')
  }

  // ── Artículos ──

  @Get()
  async listar(@Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.tiendaService.listar(clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  @Get(':id')
  async obtener(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.tiendaService.obtener(id, clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  @Post()
  async crear(@Body() dto: CreateArticuloTiendaDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.tiendaService.crear(dto, clienteIdDe(req), req.user.id)
    return new SuccessResponseDto(datos, 'Artículo creado correctamente')
  }

  @Put(':id')
  async actualizar(@Param('id') id: string, @Body() dto: UpdateArticuloTiendaDto, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.tiendaService.actualizar(id, dto, clienteIdDe(req), req.user.id)
    return new SuccessResponseDto(datos, 'Artículo actualizado correctamente')
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    await this.tiendaService.eliminar(id, clienteIdDe(req), req.user.id)
    return new SuccessResponseDto(null, 'Artículo eliminado correctamente')
  }

  @Post(':id/imagen')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('imagen', { storage: imagenMemoria, fileFilter: soloImagenes, limits: { fileSize: 5 * 1024 * 1024 } }))
  async subirImagen(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Request() req: any): Promise<SuccessResponseDto> {
    if (!file) throw new BadRequestException('Archivo requerido')
    const url = await this.tiendaService.guardarImagenProcesada(file.buffer, 'producto')
    const datos = await this.tiendaService.setImagen(id, url, clienteIdDe(req), req.user.id)
    return new SuccessResponseDto(datos, 'Imagen subida correctamente')
  }

  @Get(':id/disponibilidad')
  async listarDisponibilidad(@Param('id') id: string, @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.tiendaService.listarDisponibilidad(id, clienteIdDe(req))
    return new SuccessResponseDto(datos)
  }

  @Put(':id/disponibilidad')
  async actualizarDisponibilidad(@Param('id') id: string, @Body() filas: DisponibilidadSucursalDto[], @Request() req: any): Promise<SuccessResponseDto> {
    const datos = await this.tiendaService.actualizarDisponibilidad(id, filas, clienteIdDe(req), req.user.id)
    return new SuccessResponseDto(datos, 'Disponibilidad actualizada correctamente')
  }
}
