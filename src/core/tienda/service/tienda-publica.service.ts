import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { randomBytes, randomUUID } from 'crypto'
import { ArticuloTienda, GrupoOpcionesTienda } from '../entity/articulo-tienda.entity'
import { CarritoTienda, ItemCarritoTienda } from '../entity/carrito-tienda.entity'
import { CategoriaTienda } from '../entity/categoria-tienda.entity'
import { ArticuloSucursal } from '../entity/articulo-sucursal.entity'
import { Sucursal } from '../../sucursal/entity/sucursal.entity'
import { AgregarItemCarritoDto, ActualizarItemCarritoDto, OpcionSeleccionadaDto } from '../dto/carrito-tienda.dto'
import { PromocionTiendaService } from './promocion-tienda.service'
import { ClienteService } from '../../cliente/service/cliente.service'
import { ConversacionService } from '../../conversacion/service/conversacion.service'
import { WhatsappService } from '../../whatsapp/service/whatsapp.service'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion, USUARIO_SISTEMA } from '../../../common/constants'
import { estaFueraDeVentana24h } from '../../../common/lib/ventana-24h.util'

const normalizar = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

@Injectable()
export class TiendaPublicaService extends BaseService {
  constructor(
    @InjectRepository(ArticuloTienda)
    private readonly articuloRepo: Repository<ArticuloTienda>,
    @InjectRepository(CarritoTienda)
    private readonly carritoRepo: Repository<CarritoTienda>,
    @InjectRepository(CategoriaTienda)
    private readonly categoriaRepo: Repository<CategoriaTienda>,
    @InjectRepository(Sucursal)
    private readonly sucursalRepo: Repository<Sucursal>,
    @InjectRepository(ArticuloSucursal)
    private readonly articuloSucursalRepo: Repository<ArticuloSucursal>,
    private readonly promocionService: PromocionTiendaService,
    private readonly clienteService: ClienteService,
    private readonly conversacionService: ConversacionService,
    // forwardRef: WhatsappModule también depende de este módulo (para la herramienta
    // abrir_tienda del agente) — sin forwardRef en ambos lados, Nest no puede resolver
    // el ciclo entre TiendaModule y WhatsappModule.
    @Inject(forwardRef(() => WhatsappService))
    private readonly waService: WhatsappService,
  ) {
    super(TiendaPublicaService.name)
  }

  // ── Catálogo público ─────────────────────────────────────────

  /**
   * `sucursalId` es opcional y solo tiene efecto si el cliente tiene sucursales activas
   * (si no tiene ninguna, el catálogo se comporta exactamente igual que antes de esta
   * función existir — cero cambio para negocios de un solo local). Con sucursal resuelta,
   * cada artículo trae su `stock` de esa sucursal y se filtran los deshabilitados ahí.
   */
  async obtenerTienda(slug: string, sucursalId?: string) {
    const cliente = await this.resolverClienteTiendaActiva(slug)
    const [articulos, categorias, sucursales] = await Promise.all([
      this.articuloRepo.find({
        where: { clienteId: cliente.id, activo: true, estado: Status.ACTIVE },
        order: { categoria: 'ASC', orden: 'ASC' },
      }),
      this.categoriaRepo.find({
        where: { clienteId: cliente.id, activo: true, estado: Status.ACTIVE },
        order: { orden: 'ASC', nombre: 'ASC' },
      }),
      this.sucursalRepo.find({ where: { clienteId: cliente.id, activo: true, estado: Status.ACTIVE } }),
    ])

    const sucursalValida = sucursalId ? sucursales.find(s => s.id === sucursalId) : undefined
    const promosVigentes = await this.promocionService.obtenerVigentesPorCliente(cliente.id, sucursalValida?.id)

    let articulosFinal: any[] = articulos
    if (sucursalValida) {
      const disponibilidad = await this.articuloSucursalRepo.find({ where: { sucursalId: sucursalValida.id, estado: Status.ACTIVE } })
      const dispPorArticulo = new Map(disponibilidad.map(d => [d.articuloId, d]))
      articulosFinal = articulos
        .filter(a => (dispPorArticulo.get(a.id)?.activo ?? true))
        .map(a => ({ ...a, stock: dispPorArticulo.get(a.id)?.stock ?? null }))
    }

    const promoPorArticulo = new Map(promosVigentes.map(p => [p.articuloId, p]))
    const articulosConPromo = articulosFinal.map(a => {
      const promo = promoPorArticulo.get(a.id)
      return promo
        ? { ...a, precioPromocional: Number(promo.precioPromocional), promocionFin: promo.fechaFin }
        : a
    })

    return {
      nombre: cliente.nombre,
      slug: cliente.slug,
      logoUrl: cliente.logoUrl || null,
      portadaUrl: cliente.tiendaPortadaUrl || null,
      colorPrimario: cliente.tiendaColorPrimario || '#2563eb',
      ...this.calcularEstadoHorario(cliente.diasAtencion, cliente.horaInicioAtencion, cliente.horaFinAtencion),
      categorias: categorias.map(c => ({ nombre: c.nombre, imagenUrl: c.imagenUrl || null })),
      sucursales: sucursales.map(s => ({
        id: s.id, nombre: s.nombre, direccion: s.direccion || null,
        latitud: s.latitud != null ? Number(s.latitud) : null, longitud: s.longitud != null ? Number(s.longitud) : null,
        aceptaPagoQr: s.aceptaPagoQr, aceptaPagoEfectivo: s.aceptaPagoEfectivo, qrImagenUrl: s.qrImagenUrl || null,
      })),
      articulos: articulosConPromo,
    }
  }

  private calcularEstadoHorario(diasAtencion: string[], horaInicio?: string, horaFin?: string): { abierto: boolean | null; horaCierre: string | null } {
    if (!diasAtencion?.length || !horaInicio || !horaFin) return { abierto: null, horaCierre: null }

    const ahoraBolivia = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/La_Paz' }))
    const diaHoy = normalizar(ahoraBolivia.toLocaleDateString('es-BO', { weekday: 'long' }))
    const diasNormalizados = diasAtencion.map(normalizar)
    if (!diasNormalizados.includes(diaHoy)) return { abierto: false, horaCierre: null }

    const horaActual = `${String(ahoraBolivia.getHours()).padStart(2, '0')}:${String(ahoraBolivia.getMinutes()).padStart(2, '0')}`
    const abierto = horaActual >= horaInicio && horaActual <= horaFin
    return { abierto, horaCierre: horaFin }
  }

  // ── Carrito ───────────────────────────────────────────────────

  private async resolverClienteTiendaActiva(slug: string) {
    const cliente = await this.clienteService.obtenerPorSlug(slug).catch(() => null)
    if (!cliente || !cliente.tiendaActiva) throw new NotFoundException('Tienda no encontrada')
    return cliente
  }

  private async resolverCarrito(slug: string, token: string, requiereActivo = false): Promise<CarritoTienda> {
    const cliente = await this.resolverClienteTiendaActiva(slug)
    const carrito = await this.carritoRepo.findOne({ where: { token, clienteId: cliente.id, estado: Status.ACTIVE } })
    if (!carrito) throw new NotFoundException('Sesión de carrito no encontrada')
    if (requiereActivo && carrito.estadoCarrito !== 'activo') {
      throw new BadRequestException('Este carrito ya fue confirmado — no se puede seguir editando')
    }
    return carrito
  }

  /** Crea un carrito suelto (visita orgánica, sin pasar por el link que manda el agente). Sin sucursal todavía. */
  async crearSesion(slug: string): Promise<{ token: string }> {
    const cliente = await this.resolverClienteTiendaActiva(slug)
    const carrito = this.carritoRepo.create({
      clienteId: cliente.id,
      token: randomBytes(16).toString('hex'),
      estadoCarrito: 'activo',
      items: [],
      total: 0,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion: USUARIO_SISTEMA,
    })
    const guardado = await this.carritoRepo.save(carrito)
    return { token: guardado.token }
  }

  /**
   * Fija (o cambia) la sucursal del carrito — solo mientras esté vacío, para no dejar
   * ítems con precio/disponibilidad de una sucursal distinta a la elegida.
   */
  async elegirSucursal(slug: string, token: string, sucursalId: string): Promise<CarritoTienda> {
    const carrito = await this.resolverCarrito(slug, token, true)
    if (carrito.items.length) {
      throw new BadRequestException('No podés cambiar de sucursal con artículos ya en el carrito — vaciá el carrito primero')
    }
    const sucursal = await this.sucursalRepo.findOne({ where: { id: sucursalId, clienteId: carrito.clienteId, activo: true, estado: Status.ACTIVE } })
    if (!sucursal) throw new NotFoundException('Sucursal no encontrada')

    carrito.sucursalId = sucursal.id
    carrito.transaccion = Transacccion.ACTUALIZAR
    return this.carritoRepo.save(carrito)
  }

  /**
   * Usado por la herramienta `abrir_tienda` del agente — el carrito ya nace atado a la
   * conversación real, así el pedido puede avisarse solo por WhatsApp al confirmar.
   * Sin sucursal todavía — un solo número de WhatsApp para todo el negocio, así que la
   * sucursal se elige recién en la tienda (por ubicación del navegador o a mano).
   */
  async abrirParaConversacion(clienteId: string, conversacionId: string, contactoTelefono: string): Promise<{ ok: true; token: string; slug: string } | { ok: false; error: string }> {
    const cliente = await this.clienteService.obtener(clienteId).catch(() => null)
    if (!cliente || !cliente.tiendaActiva) {
      return { ok: false, error: 'No hay una tienda online activa configurada para este negocio.' }
    }

    const carrito = this.carritoRepo.create({
      clienteId,
      token: randomBytes(16).toString('hex'),
      conversacionId,
      contactoTelefono,
      estadoCarrito: 'activo',
      items: [],
      total: 0,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion: USUARIO_SISTEMA,
    })
    const guardado = await this.carritoRepo.save(carrito)
    return { ok: true, token: guardado.token, slug: cliente.slug }
  }

  async obtenerCarrito(slug: string, token: string): Promise<CarritoTienda> {
    return this.resolverCarrito(slug, token)
  }

  async agregarItem(slug: string, token: string, dto: AgregarItemCarritoDto): Promise<CarritoTienda> {
    const carrito = await this.resolverCarrito(slug, token, true)
    const articulo = await this.articuloRepo.findOne({ where: { id: dto.articuloId, clienteId: carrito.clienteId, activo: true, estado: Status.ACTIVE } })
    if (!articulo) throw new NotFoundException('Artículo no encontrado o ya no está disponible')

    const yaEnCarrito = carrito.items.filter(i => i.articuloId === articulo.id).reduce((s, i) => s + i.cantidad, 0)
    await this.validarDisponibilidadSucursal(articulo.id, carrito.sucursalId, yaEnCarrito + (dto.cantidad ?? 1))

    const item = await this.construirItem(articulo, dto.cantidad, dto.notas, dto.opcionesSeleccionadas, undefined, carrito.sucursalId)
    carrito.items = [...carrito.items, item]
    carrito.total = this.recalcularTotal(carrito.items)
    carrito.transaccion = Transacccion.ACTUALIZAR
    return this.carritoRepo.save(carrito)
  }

  async actualizarItem(slug: string, token: string, itemId: string, dto: ActualizarItemCarritoDto): Promise<CarritoTienda> {
    const carrito = await this.resolverCarrito(slug, token, true)
    const idx = carrito.items.findIndex(i => i.id === itemId)
    if (idx === -1) throw new NotFoundException('Ítem no encontrado en el carrito')

    const articulo = await this.articuloRepo.findOne({ where: { id: carrito.items[idx].articuloId, clienteId: carrito.clienteId, estado: Status.ACTIVE } })
    if (!articulo) throw new NotFoundException('Artículo no encontrado o ya no está disponible')

    const cantidad = dto.cantidad ?? carrito.items[idx].cantidad
    const opciones = dto.opcionesSeleccionadas ?? carrito.items[idx].opciones.map(o => ({ grupoId: o.grupoId, opcionId: o.opcionId }))
    const notas = dto.notas ?? carrito.items[idx].notas

    const enOtrasLineas = carrito.items.filter((i, n) => n !== idx && i.articuloId === articulo.id).reduce((s, i) => s + i.cantidad, 0)
    await this.validarDisponibilidadSucursal(articulo.id, carrito.sucursalId, enOtrasLineas + cantidad)

    const itemActualizado = await this.construirItem(articulo, cantidad, notas, opciones, itemId, carrito.sucursalId)
    carrito.items = carrito.items.map((i, n) => (n === idx ? itemActualizado : i))
    carrito.total = this.recalcularTotal(carrito.items)
    carrito.transaccion = Transacccion.ACTUALIZAR
    return this.carritoRepo.save(carrito)
  }

  async eliminarItem(slug: string, token: string, itemId: string): Promise<CarritoTienda> {
    const carrito = await this.resolverCarrito(slug, token, true)
    carrito.items = carrito.items.filter(i => i.id !== itemId)
    carrito.total = this.recalcularTotal(carrito.items)
    carrito.transaccion = Transacccion.ACTUALIZAR
    return this.carritoRepo.save(carrito)
  }

  async confirmar(slug: string, token: string, metodoPago?: string): Promise<CarritoTienda> {
    const carrito = await this.resolverCarrito(slug, token, true)
    if (!carrito.items.length) throw new BadRequestException('El carrito está vacío')

    let sucursal: Sucursal | null = null
    if (carrito.sucursalId) {
      sucursal = await this.sucursalRepo.findOne({ where: { id: carrito.sucursalId, estado: Status.ACTIVE } })
      if (sucursal) {
        this.validarMetodoPago(sucursal, metodoPago)
        carrito.codigoPedido = await this.generarCodigoPedido(sucursal)
        await this.descontarStock(carrito.items, sucursal.id)
      }
    }

    carrito.metodoPago = metodoPago || undefined
    carrito.estadoCarrito = 'confirmado'
    carrito.confirmadoEn = new Date()
    carrito.transaccion = Transacccion.ACTUALIZAR
    const confirmado = await this.carritoRepo.save(carrito)

    await this.avisarPorWhatsapp(confirmado, sucursal).catch(err =>
      this.logger.warn(`[TiendaPublica] No se pudo avisar el pedido por WhatsApp (carrito ${confirmado.id}): ${err.message}`),
    )

    return confirmado
  }

  // ── Helpers internos ─────────────────────────────────────────

  private validarMetodoPago(sucursal: Sucursal, metodoPago?: string): void {
    if (!metodoPago) return
    if (metodoPago === 'qr' && !sucursal.aceptaPagoQr) throw new BadRequestException(`${sucursal.nombre} no acepta pago por QR`)
    if (metodoPago === 'efectivo' && !sucursal.aceptaPagoEfectivo) throw new BadRequestException(`${sucursal.nombre} no acepta pago en efectivo`)
  }

  /** Mismo patrón que `Reserva.codigoReserva` (`reservacion.service.ts`) — COUNT con LIKE sobre el prefijo, sin columna de contador aparte. */
  private async generarCodigoPedido(sucursal: Sucursal): Promise<string> {
    const conteo = await this.carritoRepo
      .createQueryBuilder('c')
      .where('c.sucursal_id = :sucursalId', { sucursalId: sucursal.id })
      .andWhere("c.estado_carrito = 'confirmado'")
      .getCount()
    return `${sucursal.codigo}-${String(conteo + 1).padStart(4, '0')}`
  }

  /** Descuento best-effort con guarda atómica (`stock >= cantidad`) — sin locking pesado, mismo nivel de rigor que el resto del módulo. Si no hay fila de disponibilidad o el stock es null, no se rastrea y no se descuenta nada. */
  private async descontarStock(items: ItemCarritoTienda[], sucursalId: string): Promise<void> {
    const articuloIds = items.map(i => i.articuloId)
    const filas = await this.articuloSucursalRepo.find({ where: { sucursalId, articuloId: In(articuloIds), estado: Status.ACTIVE } })
    for (const item of items) {
      const fila = filas.find(f => f.articuloId === item.articuloId)
      if (!fila || fila.stock == null) continue
      const resultado = await this.articuloSucursalRepo
        .createQueryBuilder()
        .update(ArticuloSucursal)
        .set({ stock: () => `stock - ${Number(item.cantidad)}` })
        .where('id = :id', { id: fila.id })
        .andWhere('stock >= :cantidad', { cantidad: item.cantidad })
        .execute()
      if (!resultado.affected) {
        this.logger.warn(`[TiendaPublica] Stock insuficiente al confirmar para artículo ${item.articuloId} en sucursal ${sucursalId} — se confirma igual, revisar a mano`)
      }
    }
  }

  private async validarDisponibilidadSucursal(articuloId: string, sucursalId: string | undefined, cantidad: number): Promise<void> {
    if (!sucursalId) return
    const fila = await this.articuloSucursalRepo.findOne({ where: { articuloId, sucursalId, estado: Status.ACTIVE } })
    if (!fila) return // sin fila = habilitado y sin control de stock
    if (!fila.activo) throw new BadRequestException('Este artículo no está disponible en tu sucursal')
    if (fila.stock != null && fila.stock < cantidad) {
      throw new BadRequestException(fila.stock === 0 ? 'Este artículo está agotado en tu sucursal' : `Solo quedan ${fila.stock} unidades en tu sucursal`)
    }
  }

  /**
   * Recalcula precio/nombre de un ítem SIEMPRE contra el catálogo real — nunca se confía
   * en lo que mande el cliente. Si el artículo tiene una promoción vigente EN ESTE
   * MOMENTO (para la sucursal actual), el precio base del ítem es el precio promocional.
   */
  private async construirItem(articulo: ArticuloTienda, cantidad = 1, notas: string | undefined, opcionesSeleccionadas: OpcionSeleccionadaDto[] = [], itemId?: string, sucursalId?: string): Promise<ItemCarritoTienda> {
    const opciones = (opcionesSeleccionadas || []).map(sel => {
      const grupo = (articulo.gruposOpciones || []).find(g => g.id === sel.grupoId)
      const opcion = grupo?.opciones.find(o => o.id === sel.opcionId)
      if (!grupo || !opcion) throw new BadRequestException(`Opción inválida para "${articulo.nombre}"`)
      return { grupoId: grupo.id, grupoNombre: grupo.nombre, opcionId: opcion.id, opcionNombre: opcion.nombre, precioExtra: Number(opcion.precioExtra) || 0 }
    })

    this.validarGruposObligatorios(articulo.gruposOpciones || [], opciones)

    const promoVigente = await this.promocionService.obtenerVigente(articulo.id, articulo.clienteId, sucursalId)
    const precioBase = promoVigente ? Number(promoVigente.precioPromocional) : Number(articulo.precio) || 0

    return {
      id: itemId || randomUUID(),
      articuloId: articulo.id,
      nombre: articulo.nombre,
      precioBase,
      cantidad: Math.max(1, Number(cantidad) || 1),
      notas: notas?.trim() || undefined,
      opciones,
    }
  }

  private validarGruposObligatorios(grupos: GrupoOpcionesTienda[], seleccionadas: { grupoId: string }[]): void {
    for (const grupo of grupos) {
      const elegidasDelGrupo = seleccionadas.filter(s => s.grupoId === grupo.id).length
      if (grupo.obligatorio && elegidasDelGrupo < Math.max(1, grupo.min || 1)) {
        throw new BadRequestException(`Falta elegir una opción de "${grupo.nombre}"`)
      }
      if (grupo.tipo === 'unica' && elegidasDelGrupo > 1) {
        throw new BadRequestException(`"${grupo.nombre}" solo permite elegir una opción`)
      }
      if (grupo.max && elegidasDelGrupo > grupo.max) {
        throw new BadRequestException(`"${grupo.nombre}" permite como máximo ${grupo.max} opciones`)
      }
    }
  }

  private recalcularTotal(items: ItemCarritoTienda[]): number {
    return items.reduce((acc, item) => {
      const precioOpciones = item.opciones.reduce((s, o) => s + o.precioExtra, 0)
      return acc + (item.precioBase + precioOpciones) * item.cantidad
    }, 0)
  }

  private formatearPedido(carrito: CarritoTienda, sucursal: Sucursal | null): string {
    const lineas = carrito.items.map(item => {
      const opciones = item.opciones.length ? ` (${item.opciones.map(o => o.opcionNombre).join(', ')})` : ''
      const notas = item.notas ? ` — nota: ${item.notas}` : ''
      return `• ${item.cantidad}x ${item.nombre}${opciones}${notas}`
    })
    const encabezado = carrito.codigoPedido ? `🛒 Nuevo pedido ${carrito.codigoPedido}` : '🛒 Nuevo pedido desde la tienda online'
    const sucursalLinea = sucursal ? `Sucursal: ${sucursal.nombre}\n` : ''
    const pagoLinea = carrito.metodoPago ? `Pago: ${carrito.metodoPago === 'qr' ? 'QR' : 'Efectivo'}\n` : ''
    return `${encabezado}:\n${sucursalLinea}${pagoLinea}${lineas.join('\n')}\n\nTotal: Bs ${carrito.total.toFixed(2)}`
  }

  /** Best-effort: si no hay conversación asociada o está fuera de la ventana de 24h, se omite con honestidad — el pedido igual queda confirmado. */
  private async avisarPorWhatsapp(carrito: CarritoTienda, sucursal: Sucursal | null): Promise<void> {
    if (!carrito.conversacionId || !carrito.contactoTelefono) {
      this.logger.log(`[TiendaPublica] Carrito ${carrito.id} confirmado sin conversación asociada — no se avisa por WhatsApp`)
      return
    }

    const conversacion = await this.conversacionService.obtener(carrito.conversacionId).catch(() => null)
    if (!conversacion) return
    if (estaFueraDeVentana24h(conversacion.mensajes || [])) {
      this.logger.warn(`[TiendaPublica] Carrito ${carrito.id}: conversación fuera de la ventana de 24h — no se avisa por WhatsApp automáticamente`)
      return
    }

    const config = await this.waService.obtenerConfig(carrito.clienteId)
    if (!config.enabled || !config.accessToken) return

    const mensaje = this.formatearPedido(carrito, sucursal)
    await this.waService.enviarTexto(carrito.contactoTelefono, mensaje, config)
    await this.conversacionService.agregarMensaje(carrito.conversacionId, { role: 'assistant', content: mensaje })
  }
}
