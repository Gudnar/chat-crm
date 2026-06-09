import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Configuracion } from '../entity/configuracion.entity'
import { SetConfiguracionDto, VerificarApiKeyDto } from '../dto/configuracion.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import axios from 'axios'

@Injectable()
export class ConfiguracionService extends BaseService {
  constructor(
    @InjectRepository(Configuracion)
    private readonly configuracionRepository: Repository<Configuracion>
  ) {
    super(ConfiguracionService.name)
  }

  async listar(): Promise<Partial<Configuracion>[]> {
    const configs = await this.configuracionRepository.find({ where: { estado: Status.ACTIVE } })
    return configs.map(c => {
      if (c.esSecreto && c.valor) {
        return { ...c, valor: '••••••••••••••••' } as Partial<Configuracion>
      }
      return c
    })
  }

  async obtenerPorClave(clave: string): Promise<Configuracion | null> {
    return this.configuracionRepository.findOne({ where: { clave, estado: Status.ACTIVE } })
  }

  async set(dto: SetConfiguracionDto, usuarioCreacion: string): Promise<Configuracion> {
    const existe = await this.obtenerPorClave(dto.clave)
    if (existe) {
      Object.assign(existe, {
        valor: dto.valor,
        descripcion: dto.descripcion ?? existe.descripcion,
        esSecreto: dto.esSecreto ?? existe.esSecreto,
        transaccion: Transacccion.ACTUALIZAR,
        usuarioModificacion: usuarioCreacion,
      })
      return this.configuracionRepository.save(existe)
    }

    const nueva = this.configuracionRepository.create({
      ...dto,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.configuracionRepository.save(nueva)
  }

  async verificarApiKey(dto: VerificarApiKeyDto): Promise<{ valida: boolean; mensaje: string }> {
    const modelo = dto.modelo || 'claude-haiku-4-5'
    try {
      const res = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: modelo,
          max_tokens: 32,
          messages: [{ role: 'user', content: 'hola' }],
        },
        {
          headers: {
            'x-api-key': dto.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        }
      )

      if (res.data?.content) {
        return { valida: true, mensaje: `${Messages.API_KEY_VALID} Modelo: ${modelo}` }
      }
      return { valida: false, mensaje: Messages.API_KEY_INVALID }
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || Messages.API_KEY_INVALID
      return { valida: false, mensaje: msg }
    }
  }
}
