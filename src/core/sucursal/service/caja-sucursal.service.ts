import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CajaSucursal } from '../entity/caja-sucursal.entity'
import { AbrirCajaDto, CerrarCajaDto } from '../dto/caja-sucursal.dto'
import { TransaccionService } from './transaccion.service'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'

@Injectable()
export class CajaSucursalService extends BaseService {
  constructor(
    @InjectRepository(CajaSucursal)
    private readonly repo: Repository<CajaSucursal>,
    private readonly transaccionService: TransaccionService,
  ) {
    super(CajaSucursalService.name)
  }

  async obtenerCajaAbierta(sucursalId: string): Promise<CajaSucursal | null> {
    const qb = this.repo.createQueryBuilder('c')
      .where('c.sucursalId = :sucursalId', { sucursalId })
      .andWhere('c.estadoCaja = :estadoCaja', { estadoCaja: 'abierta' })
      .andWhere('c.estado = :est', { est: Status.ACTIVE })
      .orderBy('c.fechaApertura', 'DESC')
    return qb.getOne()
  }

  async abrirCaja(
    clienteId: string,
    sucursalId: string,
    usuarioId: string,
    dto: AbrirCajaDto,
    usuarioCreacion: string,
  ): Promise<CajaSucursal> {
    // Validar que no exista otra caja abierta
    const cajaAbierta = await this.obtenerCajaAbierta(sucursalId)
    if (cajaAbierta) {
      throw new BadRequestException('Ya existe una caja abierta en esta sucursal')
    }

    const caja = new CajaSucursal({
      clienteId,
      sucursalId,
      usuarioId,
      montoApertura: dto.montoApertura,
      notas: dto.notas,
      estadoCaja: 'abierta',
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })

    return this.repo.save(caja)
  }

  async cerrarCaja(
    cajaId: string,
    sucursalId: string,
    clienteId: string,
    dto: CerrarCajaDto,
    usuarioModificacion: string,
  ): Promise<CajaSucursal> {
    const caja = await this.repo.findOne({
      where: { id: cajaId, sucursalId, clienteId, estadoCaja: 'abierta', estado: Status.ACTIVE },
    })
    if (!caja) throw new NotFoundException('Caja no encontrada o ya cerrada')

    // Calcular monto cierre calculado (montoApertura + ingresos - egresos)
    const ingresos = await this.transaccionService.calcularTotalPorCaja(cajaId)
    const egresos = await this.transaccionService.calcularEgresosPorCaja(cajaId)
    const montoCierreCalculado = caja.montoApertura + ingresos - egresos

    caja.montoCierreDeclarado = dto.montoCierreDeclarado
    caja.montoCierreCalculado = montoCierreCalculado
    caja.diferencia = dto.montoCierreDeclarado - montoCierreCalculado
    caja.fechaCierre = new Date()
    caja.estadoCaja = 'cerrada'
    caja.transaccion = Transacccion.ACTUALIZAR
    caja.usuarioModificacion = usuarioModificacion

    return this.repo.save(caja)
  }

  async listarCajasPorSucursal(sucursalId: string, estadoCaja?: 'abierta' | 'cerrada'): Promise<CajaSucursal[]> {
    const qb = this.repo.createQueryBuilder('c')
      .where('c.sucursalId = :sucursalId', { sucursalId })
      .andWhere('c.estado = :est', { est: Status.ACTIVE })

    if (estadoCaja) qb.andWhere('c.estadoCaja = :estadoCaja', { estadoCaja })

    return qb.orderBy('c.fechaApertura', 'DESC').getMany()
  }
}
