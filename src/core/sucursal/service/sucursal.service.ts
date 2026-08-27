import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Sucursal } from '../entity/sucursal.entity'
import { CreateSucursalDto, UpdateSucursalDto } from '../dto/create-sucursal.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'

@Injectable()
export class SucursalService extends BaseService {
  constructor(
    @InjectRepository(Sucursal)
    private readonly repo: Repository<Sucursal>,
  ) {
    super(SucursalService.name)
  }

  async listar(
    clienteId: string,
    soloActivas = false,
  ): Promise<Sucursal[]> {
    const where: any = { clienteId, estado: Status.ACTIVE }
    if (soloActivas) where.activo = true

    return this.repo.find({ where, order: { nombre: 'ASC' } })
  }

  async obtener(id: string, clienteId: string): Promise<Sucursal> {
    const s = await this.repo.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!s) throw new NotFoundException('Sucursal no encontrada')
    return s
  }

  async crear(dto: CreateSucursalDto, clienteId: string, usuarioCreacion: string): Promise<Sucursal> {
    // Validar que código sea único por cliente
    const existente = await this.repo.findOne({
      where: { clienteId, codigo: dto.codigo, estado: Status.ACTIVE },
    })
    if (existente) {
      throw new BadRequestException(`El código "${dto.codigo}" ya existe en este cliente`)
    }

    const sucursal = this.repo.create({
      ...dto,
      clienteId,
      activo: true,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.repo.save(sucursal)
  }

  async actualizar(id: string, dto: UpdateSucursalDto, clienteId: string, usuarioModificacion: string): Promise<Sucursal> {
    const s = await this.obtener(id, clienteId)

    // Validar código único si cambió
    if (dto.codigo && dto.codigo !== s.codigo) {
      const existente = await this.repo.findOne({
        where: { clienteId, codigo: dto.codigo, estado: Status.ACTIVE },
      })
      if (existente) {
        throw new BadRequestException(`El código "${dto.codigo}" ya existe en este cliente`)
      }
    }

    Object.assign(s, dto, { transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.repo.save(s)
  }

  async eliminar(id: string, clienteId: string, usuarioModificacion: string): Promise<void> {
    const s = await this.obtener(id, clienteId)
    s.estado = Status.ELIMINATE
    s.transaccion = Transacccion.ELIMINAR
    s.usuarioModificacion = usuarioModificacion
    await this.repo.save(s)
  }

  async resumen(id: string, clienteId: string): Promise<{
    sucursal: Sucursal
    pedidosHoy: number
    stockBajo: number
    cajaAbierta: boolean
  }> {
    const sucursal = await this.obtener(id, clienteId)

    // Pendiente: implementar queries para contar pedidos, stock bajo, caja abierta
    // Por ahora retorna estructura

    return {
      sucursal,
      pedidosHoy: 0,
      stockBajo: 0,
      cajaAbierta: false,
    }
  }

  async setImagenQr(id: string, url: string, clienteId: string, usuarioModificacion: string): Promise<Sucursal> {
    const s = await this.obtener(id, clienteId)
    s.qrImagenUrl = url
    s.transaccion = Transacccion.ACTUALIZAR
    s.usuarioModificacion = usuarioModificacion
    return this.repo.save(s)
  }
}
