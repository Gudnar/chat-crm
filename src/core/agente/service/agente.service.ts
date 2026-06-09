import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import axios from 'axios'
import { Agente } from '../entity/agente.entity'
import { CreateAgenteDto, UpdateAgenteDto } from '../dto/create-agente.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'
import { Messages } from '../../../common/constants/response-messages'
import { ConfiguracionClienteService } from '../../cliente/service/configuracion-cliente.service'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'

@Injectable()
export class AgenteService extends BaseService {
  constructor(
    @InjectRepository(Agente)
    private readonly agenteRepository: Repository<Agente>,
    private readonly configuracionClienteService: ConfiguracionClienteService,
  ) {
    super(AgenteService.name)
  }

  async listar(clienteId: string): Promise<Agente[]> {
    return this.agenteRepository.find({
      where: { estado: Status.ACTIVE, clienteId },
      order: { fechaCreacion: 'DESC' },
    })
  }

  async obtener(id: string, clienteId: string): Promise<Agente> {
    const agente = await this.agenteRepository.findOne({ where: { id, estado: Status.ACTIVE, clienteId } })
    if (!agente) throw new NotFoundException(Messages.AGENTE_NOT_FOUND)
    return agente
  }

  async crear(dto: CreateAgenteDto, usuarioCreacion: string, clienteId: string): Promise<Agente> {
    const agente = this.agenteRepository.create({
      ...dto,
      clienteId,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
      activo: true,
    })
    return this.agenteRepository.save(agente)
  }

  async actualizar(id: string, dto: UpdateAgenteDto, usuarioModificacion: string, clienteId: string): Promise<Agente> {
    const agente = await this.obtener(id, clienteId)
    Object.assign(agente, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.agenteRepository.save(agente)
  }

  async eliminar(id: string, usuarioModificacion: string, clienteId: string): Promise<void> {
    const agente = await this.obtener(id, clienteId)
    agente.estado = Status.ELIMINATE
    agente.transaccion = Transacccion.ELIMINAR
    agente.usuarioModificacion = usuarioModificacion
    await this.agenteRepository.save(agente)
  }

  async incrementarContadores(id: string, mensajes: number = 1): Promise<void> {
    await this.agenteRepository.increment({ id }, 'totalMensajes', mensajes)
  }

  async testConAgente(
    id: string,
    mensaje: string,
    historial: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    clienteId: string,
  ): Promise<{ respuesta: string; modelo: string }> {
    const agente = await this.obtener(id, clienteId)

    const apiKeyConfig = await this.configuracionClienteService.obtenerPorClave(clienteId, 'ANTHROPIC_API_KEY')
    const apiKey = apiKeyConfig?.valor
    if (!apiKey || apiKey.includes('•')) {
      throw new Error('API Key de Anthropic no configurada. Ve a Configuración para agregarla.')
    }

    const messages = [
      ...historial,
      { role: 'user' as const, content: mensaje },
    ]

    const systemPrompt = agente.systemPrompt ||
      `Eres ${agente.nombre}, un asistente IA ${agente.tono || 'profesional'}. Responde en ${agente.idioma || 'español'} de forma concisa y útil.`

    const res = await axios.post(
      ANTHROPIC_API,
      {
        model: agente.modelo || 'claude-haiku-4-5',
        max_tokens: agente.maxTokens || 256,
        system: systemPrompt,
        messages,
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
      },
    )

    const respuesta = res.data?.content?.[0]?.text || 'Sin respuesta'
    return { respuesta, modelo: agente.modelo }
  }
}
