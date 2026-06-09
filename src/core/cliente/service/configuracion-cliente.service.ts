import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConfiguracionCliente } from '../entity/configuracion-cliente.entity'
import { SetConfiguracionClienteDto } from '../dto/configuracion-cliente.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'

@Injectable()
export class ConfiguracionClienteService extends BaseService {
  constructor(
    @InjectRepository(ConfiguracionCliente)
    private readonly repo: Repository<ConfiguracionCliente>,
  ) {
    super(ConfiguracionClienteService.name)
  }

  async listar(clienteId: string): Promise<Partial<ConfiguracionCliente>[]> {
    const configs = await this.repo.find({ where: { clienteId, estado: Status.ACTIVE } })
    return configs.map(c => ({
      ...c,
      valor: c.esSecreto && c.valor ? '••••••••••••••••' : c.valor,
    }))
  }

  async obtenerPorClave(clienteId: string, clave: string): Promise<ConfiguracionCliente | null> {
    return this.repo.findOne({ where: { clienteId, clave, estado: Status.ACTIVE } })
  }

  async set(clienteId: string, dto: SetConfiguracionClienteDto, usuarioCreacion: string): Promise<ConfiguracionCliente> {
    const existe = await this.obtenerPorClave(clienteId, dto.clave)
    if (existe) {
      Object.assign(existe, {
        valor: dto.valor,
        descripcion: dto.descripcion ?? existe.descripcion,
        esSecreto: dto.esSecreto ?? existe.esSecreto,
        transaccion: Transacccion.ACTUALIZAR,
        usuarioModificacion: usuarioCreacion,
      })
      return this.repo.save(existe)
    }

    const nueva = this.repo.create({
      ...dto,
      clienteId,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.repo.save(nueva)
  }

  async eliminar(clienteId: string, clave: string, usuarioModificacion: string): Promise<void> {
    const config = await this.obtenerPorClave(clienteId, clave)
    if (!config) return
    config.estado = Status.ELIMINATE
    config.transaccion = Transacccion.ELIMINAR
    config.usuarioModificacion = usuarioModificacion
    await this.repo.save(config)
  }

  // Resuelve clienteId a partir del phoneNumberId de WhatsApp (usado en el webhook POST)
  async resolverClientePorPhoneNumberId(phoneNumberId: string): Promise<string | null> {
    const config = await this.repo.findOne({
      where: { clave: 'WA_PHONE_NUMBER_ID', valor: phoneNumberId, estado: Status.ACTIVE },
    })
    return config?.clienteId ?? null
  }

  // Resuelve clienteId a partir del verifyToken de WhatsApp (usado en el webhook GET de verificación)
  async resolverClientePorVerifyToken(verifyToken: string): Promise<string | null> {
    const config = await this.repo.findOne({
      where: { clave: 'WA_VERIFY_TOKEN', valor: verifyToken, estado: Status.ACTIVE },
    })
    return config?.clienteId ?? null
  }
}
