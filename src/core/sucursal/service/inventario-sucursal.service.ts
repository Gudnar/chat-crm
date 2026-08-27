import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { InventarioSucursal } from '../entity/inventario-sucursal.entity'
import { CreateInventarioSucursalDto, UpdateInventarioSucursalDto, AjustarStockDto } from '../dto/inventario-sucursal.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'

@Injectable()
export class InventarioSucursalService extends BaseService {
  constructor(
    @InjectRepository(InventarioSucursal)
    private readonly repo: Repository<InventarioSucursal>,
  ) {
    super(InventarioSucursalService.name)
  }

  async listarPorSucursal(sucursalId: string): Promise<InventarioSucursal[]> {
    return this.repo.find({
      where: { sucursalId, estado: Status.ACTIVE, activo: true },
      order: { id: 'ASC' },
    })
  }

  async obtenerPorProducto(productoId: string, sucursalId: string): Promise<InventarioSucursal> {
    const inv = await this.repo.findOne({
      where: { productoId, sucursalId, estado: Status.ACTIVE },
    })
    if (!inv) throw new NotFoundException('Inventario no encontrado')
    return inv
  }

  async crear(sucursalId: string, dto: CreateInventarioSucursalDto, usuarioCreacion: string): Promise<InventarioSucursal> {
    // Validar que no exista ya
    const existente = await this.repo.findOne({
      where: { sucursalId, productoId: dto.productoId },
    })
    if (existente && existente.estado === Status.ACTIVE) {
      throw new BadRequestException('Este producto ya existe en el inventario de la sucursal')
    }

    const inventario = new InventarioSucursal({
      sucursalId,
      productoId: dto.productoId,
      stock: dto.stock !== undefined ? dto.stock : undefined,
      stockMinimo: dto.stockMinimo || 5,
      activo: true,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.repo.save(inventario)
  }

  async actualizar(
    id: string,
    sucursalId: string,
    dto: UpdateInventarioSucursalDto,
    usuarioModificacion: string,
  ): Promise<InventarioSucursal> {
    const inv = await this.repo.findOne({
      where: { id, sucursalId, estado: Status.ACTIVE },
    })
    if (!inv) throw new NotFoundException('Inventario no encontrado')

    Object.assign(inv, dto, { transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(inv)
  }

  async eliminar(id: string, sucursalId: string, usuarioModificacion: string): Promise<void> {
    const inv = await this.repo.findOne({
      where: { id, sucursalId, estado: Status.ACTIVE },
    })
    if (!inv) throw new NotFoundException('Inventario no encontrado')

    inv.estado = Status.ELIMINATE
    inv.transaccion = Transacccion.ELIMINAR
    inv.usuarioModificacion = usuarioModificacion
    await this.repo.save(inv)
  }

  async ajustarStock(productoId: string, sucursalId: string, dto: AjustarStockDto, usuarioModificacion: string): Promise<InventarioSucursal> {
    const inv = await this.obtenerPorProducto(productoId, sucursalId)

    if (inv.stock === null || inv.stock === undefined) {
      // Stock ilimitado, no ajustar
      return inv
    }

    if (inv.stock < dto.cantidad) {
      throw new BadRequestException(`Stock insuficiente. Disponible: ${inv.stock}, solicitado: ${dto.cantidad}`)
    }

    inv.stock = inv.stock - dto.cantidad
    inv.transaccion = Transacccion.ACTUALIZAR
    inv.usuarioModificacion = usuarioModificacion
    return this.repo.save(inv)
  }

  async listarStockBajo(sucursalId: string): Promise<InventarioSucursal[]> {
    return this.repo.query(
      `SELECT * FROM inventario_sucursal
       WHERE sucursal_id = $1
       AND estado = $2
       AND activo = true
       AND stock IS NOT NULL
       AND stock <= stock_minimo
       ORDER BY stock ASC`,
      [sucursalId, Status.ACTIVE],
    )
  }
}
