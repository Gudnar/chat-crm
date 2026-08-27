"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TiendaPublicaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiendaPublicaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const articulo_tienda_entity_1 = require("../entity/articulo-tienda.entity");
const carrito_tienda_entity_1 = require("../entity/carrito-tienda.entity");
const categoria_tienda_entity_1 = require("../entity/categoria-tienda.entity");
const articulo_sucursal_entity_1 = require("../entity/articulo-sucursal.entity");
const sucursal_entity_1 = require("../../sucursal/entity/sucursal.entity");
const promocion_tienda_service_1 = require("./promocion-tienda.service");
const cliente_service_1 = require("../../cliente/service/cliente.service");
const conversacion_service_1 = require("../../conversacion/service/conversacion.service");
const whatsapp_service_1 = require("../../whatsapp/service/whatsapp.service");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
const ventana_24h_util_1 = require("../../../common/lib/ventana-24h.util");
const normalizar = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
let TiendaPublicaService = TiendaPublicaService_1 = class TiendaPublicaService extends base_service_1.BaseService {
    constructor(articuloRepo, carritoRepo, categoriaRepo, sucursalRepo, articuloSucursalRepo, promocionService, clienteService, conversacionService, waService) {
        super(TiendaPublicaService_1.name);
        this.articuloRepo = articuloRepo;
        this.carritoRepo = carritoRepo;
        this.categoriaRepo = categoriaRepo;
        this.sucursalRepo = sucursalRepo;
        this.articuloSucursalRepo = articuloSucursalRepo;
        this.promocionService = promocionService;
        this.clienteService = clienteService;
        this.conversacionService = conversacionService;
        this.waService = waService;
    }
    async obtenerTienda(slug, sucursalId) {
        const cliente = await this.resolverClienteTiendaActiva(slug);
        const [articulos, categorias, sucursales] = await Promise.all([
            this.articuloRepo.find({
                where: { clienteId: cliente.id, activo: true, estado: constants_1.Status.ACTIVE },
                order: { categoria: 'ASC', orden: 'ASC' },
            }),
            this.categoriaRepo.find({
                where: { clienteId: cliente.id, activo: true, estado: constants_1.Status.ACTIVE },
                order: { orden: 'ASC', nombre: 'ASC' },
            }),
            this.sucursalRepo.find({ where: { clienteId: cliente.id, activo: true, estado: constants_1.Status.ACTIVE } }),
        ]);
        const sucursalValida = sucursalId ? sucursales.find(s => s.id === sucursalId) : undefined;
        const promosVigentes = await this.promocionService.obtenerVigentesPorCliente(cliente.id, sucursalValida?.id);
        let articulosFinal = articulos;
        if (sucursalValida) {
            const disponibilidad = await this.articuloSucursalRepo.find({ where: { sucursalId: sucursalValida.id, estado: constants_1.Status.ACTIVE } });
            const dispPorArticulo = new Map(disponibilidad.map(d => [d.articuloId, d]));
            articulosFinal = articulos
                .filter(a => (dispPorArticulo.get(a.id)?.activo ?? true))
                .map(a => ({ ...a, stock: dispPorArticulo.get(a.id)?.stock ?? null }));
        }
        const promoPorArticulo = new Map(promosVigentes.map(p => [p.articuloId, p]));
        const articulosConPromo = articulosFinal.map(a => {
            const promo = promoPorArticulo.get(a.id);
            return promo
                ? { ...a, precioPromocional: Number(promo.precioPromocional), promocionFin: promo.fechaFin }
                : a;
        });
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
        };
    }
    calcularEstadoHorario(diasAtencion, horaInicio, horaFin) {
        if (!diasAtencion?.length || !horaInicio || !horaFin)
            return { abierto: null, horaCierre: null };
        const ahoraBolivia = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/La_Paz' }));
        const diaHoy = normalizar(ahoraBolivia.toLocaleDateString('es-BO', { weekday: 'long' }));
        const diasNormalizados = diasAtencion.map(normalizar);
        if (!diasNormalizados.includes(diaHoy))
            return { abierto: false, horaCierre: null };
        const horaActual = `${String(ahoraBolivia.getHours()).padStart(2, '0')}:${String(ahoraBolivia.getMinutes()).padStart(2, '0')}`;
        const abierto = horaActual >= horaInicio && horaActual <= horaFin;
        return { abierto, horaCierre: horaFin };
    }
    async resolverClienteTiendaActiva(slug) {
        const cliente = await this.clienteService.obtenerPorSlug(slug).catch(() => null);
        if (!cliente || !cliente.tiendaActiva)
            throw new common_1.NotFoundException('Tienda no encontrada');
        return cliente;
    }
    async resolverCarrito(slug, token, requiereActivo = false) {
        const cliente = await this.resolverClienteTiendaActiva(slug);
        const carrito = await this.carritoRepo.findOne({ where: { token, clienteId: cliente.id, estado: constants_1.Status.ACTIVE } });
        if (!carrito)
            throw new common_1.NotFoundException('Sesión de carrito no encontrada');
        if (requiereActivo && carrito.estadoCarrito !== 'activo') {
            throw new common_1.BadRequestException('Este carrito ya fue confirmado — no se puede seguir editando');
        }
        return carrito;
    }
    async crearSesion(slug) {
        const cliente = await this.resolverClienteTiendaActiva(slug);
        const carrito = this.carritoRepo.create({
            clienteId: cliente.id,
            token: (0, crypto_1.randomBytes)(16).toString('hex'),
            estadoCarrito: 'activo',
            items: [],
            total: 0,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion: constants_1.USUARIO_SISTEMA,
        });
        const guardado = await this.carritoRepo.save(carrito);
        return { token: guardado.token };
    }
    async elegirSucursal(slug, token, sucursalId) {
        const carrito = await this.resolverCarrito(slug, token, true);
        if (carrito.items.length) {
            throw new common_1.BadRequestException('No podés cambiar de sucursal con artículos ya en el carrito — vaciá el carrito primero');
        }
        const sucursal = await this.sucursalRepo.findOne({ where: { id: sucursalId, clienteId: carrito.clienteId, activo: true, estado: constants_1.Status.ACTIVE } });
        if (!sucursal)
            throw new common_1.NotFoundException('Sucursal no encontrada');
        carrito.sucursalId = sucursal.id;
        carrito.transaccion = constants_1.Transacccion.ACTUALIZAR;
        return this.carritoRepo.save(carrito);
    }
    async abrirParaConversacion(clienteId, conversacionId, contactoTelefono) {
        const cliente = await this.clienteService.obtener(clienteId).catch(() => null);
        if (!cliente || !cliente.tiendaActiva) {
            return { ok: false, error: 'No hay una tienda online activa configurada para este negocio.' };
        }
        const carrito = this.carritoRepo.create({
            clienteId,
            token: (0, crypto_1.randomBytes)(16).toString('hex'),
            conversacionId,
            contactoTelefono,
            estadoCarrito: 'activo',
            items: [],
            total: 0,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion: constants_1.USUARIO_SISTEMA,
        });
        const guardado = await this.carritoRepo.save(carrito);
        return { ok: true, token: guardado.token, slug: cliente.slug };
    }
    async obtenerCarrito(slug, token) {
        return this.resolverCarrito(slug, token);
    }
    async agregarItem(slug, token, dto) {
        const carrito = await this.resolverCarrito(slug, token, true);
        const articulo = await this.articuloRepo.findOne({ where: { id: dto.articuloId, clienteId: carrito.clienteId, activo: true, estado: constants_1.Status.ACTIVE } });
        if (!articulo)
            throw new common_1.NotFoundException('Artículo no encontrado o ya no está disponible');
        const yaEnCarrito = carrito.items.filter(i => i.articuloId === articulo.id).reduce((s, i) => s + i.cantidad, 0);
        await this.validarDisponibilidadSucursal(articulo.id, carrito.sucursalId, yaEnCarrito + (dto.cantidad ?? 1));
        const item = await this.construirItem(articulo, dto.cantidad, dto.notas, dto.opcionesSeleccionadas, undefined, carrito.sucursalId);
        carrito.items = [...carrito.items, item];
        carrito.total = this.recalcularTotal(carrito.items);
        carrito.transaccion = constants_1.Transacccion.ACTUALIZAR;
        return this.carritoRepo.save(carrito);
    }
    async actualizarItem(slug, token, itemId, dto) {
        const carrito = await this.resolverCarrito(slug, token, true);
        const idx = carrito.items.findIndex(i => i.id === itemId);
        if (idx === -1)
            throw new common_1.NotFoundException('Ítem no encontrado en el carrito');
        const articulo = await this.articuloRepo.findOne({ where: { id: carrito.items[idx].articuloId, clienteId: carrito.clienteId, estado: constants_1.Status.ACTIVE } });
        if (!articulo)
            throw new common_1.NotFoundException('Artículo no encontrado o ya no está disponible');
        const cantidad = dto.cantidad ?? carrito.items[idx].cantidad;
        const opciones = dto.opcionesSeleccionadas ?? carrito.items[idx].opciones.map(o => ({ grupoId: o.grupoId, opcionId: o.opcionId }));
        const notas = dto.notas ?? carrito.items[idx].notas;
        const enOtrasLineas = carrito.items.filter((i, n) => n !== idx && i.articuloId === articulo.id).reduce((s, i) => s + i.cantidad, 0);
        await this.validarDisponibilidadSucursal(articulo.id, carrito.sucursalId, enOtrasLineas + cantidad);
        const itemActualizado = await this.construirItem(articulo, cantidad, notas, opciones, itemId, carrito.sucursalId);
        carrito.items = carrito.items.map((i, n) => (n === idx ? itemActualizado : i));
        carrito.total = this.recalcularTotal(carrito.items);
        carrito.transaccion = constants_1.Transacccion.ACTUALIZAR;
        return this.carritoRepo.save(carrito);
    }
    async eliminarItem(slug, token, itemId) {
        const carrito = await this.resolverCarrito(slug, token, true);
        carrito.items = carrito.items.filter(i => i.id !== itemId);
        carrito.total = this.recalcularTotal(carrito.items);
        carrito.transaccion = constants_1.Transacccion.ACTUALIZAR;
        return this.carritoRepo.save(carrito);
    }
    async confirmar(slug, token, metodoPago) {
        const carrito = await this.resolverCarrito(slug, token, true);
        if (!carrito.items.length)
            throw new common_1.BadRequestException('El carrito está vacío');
        let sucursal = null;
        if (carrito.sucursalId) {
            sucursal = await this.sucursalRepo.findOne({ where: { id: carrito.sucursalId, estado: constants_1.Status.ACTIVE } });
            if (sucursal) {
                this.validarMetodoPago(sucursal, metodoPago);
                carrito.codigoPedido = await this.generarCodigoPedido(sucursal);
                await this.descontarStock(carrito.items, sucursal.id);
            }
        }
        carrito.metodoPago = metodoPago || undefined;
        carrito.estadoCarrito = 'confirmado';
        carrito.confirmadoEn = new Date();
        carrito.transaccion = constants_1.Transacccion.ACTUALIZAR;
        const confirmado = await this.carritoRepo.save(carrito);
        await this.avisarPorWhatsapp(confirmado, sucursal).catch(err => this.logger.warn(`[TiendaPublica] No se pudo avisar el pedido por WhatsApp (carrito ${confirmado.id}): ${err.message}`));
        return confirmado;
    }
    validarMetodoPago(sucursal, metodoPago) {
        if (!metodoPago)
            return;
        if (metodoPago === 'qr' && !sucursal.aceptaPagoQr)
            throw new common_1.BadRequestException(`${sucursal.nombre} no acepta pago por QR`);
        if (metodoPago === 'efectivo' && !sucursal.aceptaPagoEfectivo)
            throw new common_1.BadRequestException(`${sucursal.nombre} no acepta pago en efectivo`);
    }
    async generarCodigoPedido(sucursal) {
        const conteo = await this.carritoRepo
            .createQueryBuilder('c')
            .where('c.sucursal_id = :sucursalId', { sucursalId: sucursal.id })
            .andWhere("c.estado_carrito = 'confirmado'")
            .getCount();
        return `${sucursal.codigo}-${String(conteo + 1).padStart(4, '0')}`;
    }
    async descontarStock(items, sucursalId) {
        const articuloIds = items.map(i => i.articuloId);
        const filas = await this.articuloSucursalRepo.find({ where: { sucursalId, articuloId: (0, typeorm_2.In)(articuloIds), estado: constants_1.Status.ACTIVE } });
        for (const item of items) {
            const fila = filas.find(f => f.articuloId === item.articuloId);
            if (!fila || fila.stock == null)
                continue;
            const resultado = await this.articuloSucursalRepo
                .createQueryBuilder()
                .update(articulo_sucursal_entity_1.ArticuloSucursal)
                .set({ stock: () => `stock - ${Number(item.cantidad)}` })
                .where('id = :id', { id: fila.id })
                .andWhere('stock >= :cantidad', { cantidad: item.cantidad })
                .execute();
            if (!resultado.affected) {
                this.logger.warn(`[TiendaPublica] Stock insuficiente al confirmar para artículo ${item.articuloId} en sucursal ${sucursalId} — se confirma igual, revisar a mano`);
            }
        }
    }
    async validarDisponibilidadSucursal(articuloId, sucursalId, cantidad) {
        if (!sucursalId)
            return;
        const fila = await this.articuloSucursalRepo.findOne({ where: { articuloId, sucursalId, estado: constants_1.Status.ACTIVE } });
        if (!fila)
            return;
        if (!fila.activo)
            throw new common_1.BadRequestException('Este artículo no está disponible en tu sucursal');
        if (fila.stock != null && fila.stock < cantidad) {
            throw new common_1.BadRequestException(fila.stock === 0 ? 'Este artículo está agotado en tu sucursal' : `Solo quedan ${fila.stock} unidades en tu sucursal`);
        }
    }
    async construirItem(articulo, cantidad = 1, notas, opcionesSeleccionadas = [], itemId, sucursalId) {
        const opciones = (opcionesSeleccionadas || []).map(sel => {
            const grupo = (articulo.gruposOpciones || []).find(g => g.id === sel.grupoId);
            const opcion = grupo?.opciones.find(o => o.id === sel.opcionId);
            if (!grupo || !opcion)
                throw new common_1.BadRequestException(`Opción inválida para "${articulo.nombre}"`);
            return { grupoId: grupo.id, grupoNombre: grupo.nombre, opcionId: opcion.id, opcionNombre: opcion.nombre, precioExtra: Number(opcion.precioExtra) || 0 };
        });
        this.validarGruposObligatorios(articulo.gruposOpciones || [], opciones);
        const promoVigente = await this.promocionService.obtenerVigente(articulo.id, articulo.clienteId, sucursalId);
        const precioBase = promoVigente ? Number(promoVigente.precioPromocional) : Number(articulo.precio) || 0;
        return {
            id: itemId || (0, crypto_1.randomUUID)(),
            articuloId: articulo.id,
            nombre: articulo.nombre,
            precioBase,
            cantidad: Math.max(1, Number(cantidad) || 1),
            notas: notas?.trim() || undefined,
            opciones,
        };
    }
    validarGruposObligatorios(grupos, seleccionadas) {
        for (const grupo of grupos) {
            const elegidasDelGrupo = seleccionadas.filter(s => s.grupoId === grupo.id).length;
            if (grupo.obligatorio && elegidasDelGrupo < Math.max(1, grupo.min || 1)) {
                throw new common_1.BadRequestException(`Falta elegir una opción de "${grupo.nombre}"`);
            }
            if (grupo.tipo === 'unica' && elegidasDelGrupo > 1) {
                throw new common_1.BadRequestException(`"${grupo.nombre}" solo permite elegir una opción`);
            }
            if (grupo.max && elegidasDelGrupo > grupo.max) {
                throw new common_1.BadRequestException(`"${grupo.nombre}" permite como máximo ${grupo.max} opciones`);
            }
        }
    }
    recalcularTotal(items) {
        return items.reduce((acc, item) => {
            const precioOpciones = item.opciones.reduce((s, o) => s + o.precioExtra, 0);
            return acc + (item.precioBase + precioOpciones) * item.cantidad;
        }, 0);
    }
    formatearPedido(carrito, sucursal) {
        const lineas = carrito.items.map(item => {
            const opciones = item.opciones.length ? ` (${item.opciones.map(o => o.opcionNombre).join(', ')})` : '';
            const notas = item.notas ? ` — nota: ${item.notas}` : '';
            return `• ${item.cantidad}x ${item.nombre}${opciones}${notas}`;
        });
        const encabezado = carrito.codigoPedido ? `🛒 Nuevo pedido ${carrito.codigoPedido}` : '🛒 Nuevo pedido desde la tienda online';
        const sucursalLinea = sucursal ? `Sucursal: ${sucursal.nombre}\n` : '';
        const pagoLinea = carrito.metodoPago ? `Pago: ${carrito.metodoPago === 'qr' ? 'QR' : 'Efectivo'}\n` : '';
        return `${encabezado}:\n${sucursalLinea}${pagoLinea}${lineas.join('\n')}\n\nTotal: Bs ${carrito.total.toFixed(2)}`;
    }
    async avisarPorWhatsapp(carrito, sucursal) {
        if (!carrito.conversacionId || !carrito.contactoTelefono) {
            this.logger.log(`[TiendaPublica] Carrito ${carrito.id} confirmado sin conversación asociada — no se avisa por WhatsApp`);
            return;
        }
        const conversacion = await this.conversacionService.obtener(carrito.conversacionId).catch(() => null);
        if (!conversacion)
            return;
        if ((0, ventana_24h_util_1.estaFueraDeVentana24h)(conversacion.mensajes || [])) {
            this.logger.warn(`[TiendaPublica] Carrito ${carrito.id}: conversación fuera de la ventana de 24h — no se avisa por WhatsApp automáticamente`);
            return;
        }
        const config = await this.waService.obtenerConfig(carrito.clienteId);
        if (!config.enabled || !config.accessToken)
            return;
        const mensaje = this.formatearPedido(carrito, sucursal);
        await this.waService.enviarTexto(carrito.contactoTelefono, mensaje, config);
        await this.conversacionService.agregarMensaje(carrito.conversacionId, { role: 'assistant', content: mensaje });
    }
};
TiendaPublicaService = TiendaPublicaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(articulo_tienda_entity_1.ArticuloTienda)),
    __param(1, (0, typeorm_1.InjectRepository)(carrito_tienda_entity_1.CarritoTienda)),
    __param(2, (0, typeorm_1.InjectRepository)(categoria_tienda_entity_1.CategoriaTienda)),
    __param(3, (0, typeorm_1.InjectRepository)(sucursal_entity_1.Sucursal)),
    __param(4, (0, typeorm_1.InjectRepository)(articulo_sucursal_entity_1.ArticuloSucursal)),
    __param(8, (0, common_1.Inject)((0, common_1.forwardRef)(() => whatsapp_service_1.WhatsappService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        promocion_tienda_service_1.PromocionTiendaService,
        cliente_service_1.ClienteService,
        conversacion_service_1.ConversacionService,
        whatsapp_service_1.WhatsappService])
], TiendaPublicaService);
exports.TiendaPublicaService = TiendaPublicaService;
//# sourceMappingURL=tienda-publica.service.js.map