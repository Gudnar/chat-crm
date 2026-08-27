import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { TiendaPublicaService } from '../service/tienda-publica.service'
import { AgregarItemCarritoDto, ActualizarItemCarritoDto, ElegirSucursalDto, ConfirmarPedidoDto } from '../dto/carrito-tienda.dto'
import { SuccessResponseDto } from '../../../common/dto/success-response.dto'

/**
 * Sin @UseGuards a propósito: este backend no registra un guard global (ver
 * main.ts), así que alcanza con no decorar la clase para que quede público —
 * son los únicos endpoints del sistema pensados para alcanzarse sin login, ya
 * que el cliente final abre el link de la tienda desde WhatsApp sin cuenta.
 */
@ApiTags('Tienda pública')
@Controller('tienda-publica')
export class TiendaPublicaController {
  constructor(private readonly tiendaPublicaService: TiendaPublicaService) {}

  @Get(':slug')
  async obtenerTienda(@Param('slug') slug: string, @Query('sucursalId') sucursalId?: string): Promise<SuccessResponseDto> {
    const datos = await this.tiendaPublicaService.obtenerTienda(slug, sucursalId)
    return new SuccessResponseDto(datos)
  }

  @Post(':slug/sesion')
  async crearSesion(@Param('slug') slug: string): Promise<SuccessResponseDto> {
    const datos = await this.tiendaPublicaService.crearSesion(slug)
    return new SuccessResponseDto(datos)
  }

  @Put(':slug/sesion/:token/sucursal')
  async elegirSucursal(@Param('slug') slug: string, @Param('token') token: string, @Body() dto: ElegirSucursalDto): Promise<SuccessResponseDto> {
    const datos = await this.tiendaPublicaService.elegirSucursal(slug, token, dto.sucursalId)
    return new SuccessResponseDto(datos, 'Sucursal seleccionada')
  }

  @Get(':slug/sesion/:token')
  async obtenerCarrito(@Param('slug') slug: string, @Param('token') token: string): Promise<SuccessResponseDto> {
    const datos = await this.tiendaPublicaService.obtenerCarrito(slug, token)
    return new SuccessResponseDto(datos)
  }

  @Post(':slug/sesion/:token/items')
  async agregarItem(
    @Param('slug') slug: string,
    @Param('token') token: string,
    @Body() dto: AgregarItemCarritoDto,
  ): Promise<SuccessResponseDto> {
    const datos = await this.tiendaPublicaService.agregarItem(slug, token, dto)
    return new SuccessResponseDto(datos, 'Agregado al carrito')
  }

  @Put(':slug/sesion/:token/items/:itemId')
  async actualizarItem(
    @Param('slug') slug: string,
    @Param('token') token: string,
    @Param('itemId') itemId: string,
    @Body() dto: ActualizarItemCarritoDto,
  ): Promise<SuccessResponseDto> {
    const datos = await this.tiendaPublicaService.actualizarItem(slug, token, itemId, dto)
    return new SuccessResponseDto(datos, 'Carrito actualizado')
  }

  @Delete(':slug/sesion/:token/items/:itemId')
  async eliminarItem(
    @Param('slug') slug: string,
    @Param('token') token: string,
    @Param('itemId') itemId: string,
  ): Promise<SuccessResponseDto> {
    const datos = await this.tiendaPublicaService.eliminarItem(slug, token, itemId)
    return new SuccessResponseDto(datos, 'Ítem eliminado')
  }

  @Post(':slug/sesion/:token/confirmar')
  async confirmar(@Param('slug') slug: string, @Param('token') token: string, @Body() dto: ConfirmarPedidoDto): Promise<SuccessResponseDto> {
    const datos = await this.tiendaPublicaService.confirmar(slug, token, dto?.metodoPago)
    return new SuccessResponseDto(datos, 'Pedido confirmado')
  }
}
