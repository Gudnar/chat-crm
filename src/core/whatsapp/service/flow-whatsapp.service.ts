import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FlowWhatsapp, CampoFlow } from '../entity/flow-whatsapp.entity'
import { CreateFlowWhatsappDto, UpdateFlowWhatsappDto } from '../dto/flow-whatsapp.dto'
import { WhatsappService } from './whatsapp.service'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion, EstadoFlowWhatsapp } from '../../../common/constants'

const NOMBRE_VALIDO = /^[a-z0-9_]+$/
const SCREEN_ID = 'FORMULARIO'

@Injectable()
export class FlowWhatsappService extends BaseService {
  constructor(
    @InjectRepository(FlowWhatsapp)
    private readonly flowRepository: Repository<FlowWhatsapp>,
    private readonly waService: WhatsappService,
  ) {
    super(FlowWhatsappService.name)
  }

  async listar(clienteId: string): Promise<FlowWhatsapp[]> {
    return this.flowRepository.find({
      where: { clienteId, estado: Status.ACTIVE },
      order: { fechaCreacion: 'DESC' },
    })
  }

  async obtener(id: string, clienteId: string): Promise<FlowWhatsapp> {
    const flow = await this.flowRepository.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!flow) throw new NotFoundException('Flow no encontrado')
    return flow
  }

  /** Crea el flow en Meta (queda en DRAFT) y guarda la fila local. */
  async crear(dto: CreateFlowWhatsappDto, clienteId: string, usuarioCreacion: string): Promise<FlowWhatsapp> {
    const nombre = dto.nombre.trim().toLowerCase()
    if (!NOMBRE_VALIDO.test(nombre)) {
      throw new BadRequestException('El nombre solo puede tener minúsculas, números y guion bajo (ej. "reserva_spa")')
    }
    this.validarCampos(dto.campos)

    const config = await this.waService.obtenerConfig(clienteId)
    if (!config.wabaId || !config.accessToken) {
      throw new BadRequestException('Falta configurar WhatsApp (WABA ID / Access Token) antes de crear flows')
    }

    const screenTitle = dto.screenTitle?.trim() || 'Formulario'
    const flowJson = this.construirFlowJson(dto.campos, screenTitle)

    let metaFlowId: string | undefined
    try {
      const respuesta = await this.waService.crearFlowMeta(config, {
        name: nombre,
        categories: [dto.categoria],
        flow_json: flowJson,
      })
      metaFlowId = respuesta.id
    } catch (err: any) {
      const msg = err?.response?.data?.error?.error_user_msg || err?.response?.data?.error?.message || err.message
      throw new BadRequestException(`Meta rechazó la creación del flow: ${msg}`)
    }

    const flow = this.flowRepository.create({
      clienteId,
      nombre,
      categoria: dto.categoria,
      estadoFlow: EstadoFlowWhatsapp.BORRADOR,
      metaFlowId,
      cta: dto.cta?.trim() || 'Comenzar',
      mensajeCuerpo: dto.mensajeCuerpo,
      screenTitle,
      campos: dto.campos,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.flowRepository.save(flow)
  }

  /** Solo permitido si sigue en borrador — un flow publicado hay que duplicarlo como uno nuevo. */
  async actualizar(id: string, dto: UpdateFlowWhatsappDto, clienteId: string, usuarioModificacion: string): Promise<FlowWhatsapp> {
    const flow = await this.obtener(id, clienteId)
    if (flow.estadoFlow !== EstadoFlowWhatsapp.BORRADOR) {
      throw new BadRequestException('Solo se puede editar un flow en borrador — duplicalo si querés cambiar uno publicado')
    }
    if (dto.campos) this.validarCampos(dto.campos)

    flow.categoria = dto.categoria ?? flow.categoria
    flow.cta = dto.cta?.trim() || flow.cta
    flow.mensajeCuerpo = dto.mensajeCuerpo ?? flow.mensajeCuerpo
    flow.screenTitle = dto.screenTitle?.trim() || flow.screenTitle
    flow.campos = dto.campos ?? flow.campos

    if (dto.campos || dto.screenTitle) {
      const config = await this.waService.obtenerConfig(clienteId)
      const flowJson = this.construirFlowJson(flow.campos, flow.screenTitle)
      try {
        await this.waService.actualizarFlowMeta(config, flow.metaFlowId!, flowJson)
      } catch (err: any) {
        const msg = err?.response?.data?.error?.error_user_msg || err?.response?.data?.error?.message || err.message
        throw new BadRequestException(`Meta rechazó la actualización del flow: ${msg}`)
      }
    }

    flow.transaccion = Transacccion.ACTUALIZAR
    flow.usuarioModificacion = usuarioModificacion
    return this.flowRepository.save(flow)
  }

  /** Publica — sin revisión humana de Meta, validación automática e inmediata. */
  async publicar(id: string, clienteId: string): Promise<FlowWhatsapp> {
    const flow = await this.obtener(id, clienteId)
    if (flow.estadoFlow === EstadoFlowWhatsapp.PUBLICADO) return flow
    const config = await this.waService.obtenerConfig(clienteId)
    try {
      await this.waService.publicarFlowMeta(config, flow.metaFlowId!)
    } catch (err: any) {
      const msg = err?.response?.data?.error?.error_user_msg || err?.response?.data?.error?.message || err.message
      flow.estadoFlow = EstadoFlowWhatsapp.ERROR_VALIDACION
      flow.erroresValidacion = msg
      flow.transaccion = Transacccion.ACTUALIZAR
      await this.flowRepository.save(flow)
      throw new BadRequestException(`Meta rechazó la publicación: ${msg}`)
    }
    flow.estadoFlow = EstadoFlowWhatsapp.PUBLICADO
    flow.erroresValidacion = null
    flow.transaccion = Transacccion.ACTUALIZAR
    return this.flowRepository.save(flow)
  }

  /** Consulta a Meta el estado real (útil tras crear/actualizar, para ver errores de validación). */
  async sincronizarEstado(id: string, clienteId: string): Promise<FlowWhatsapp> {
    const flow = await this.obtener(id, clienteId)
    if (!flow.metaFlowId) return flow

    const config = await this.waService.obtenerConfig(clienteId)
    const respuesta = await this.waService.obtenerEstadoFlowMeta(config, flow.metaFlowId)

    const mapaEstados: Record<string, string> = {
      DRAFT: EstadoFlowWhatsapp.BORRADOR,
      PUBLISHED: EstadoFlowWhatsapp.PUBLICADO,
      DEPRECATED: EstadoFlowWhatsapp.OBSOLETO,
    }
    flow.estadoFlow = mapaEstados[respuesta.status] || flow.estadoFlow
    flow.erroresValidacion = respuesta.validation_errors?.length ? JSON.stringify(respuesta.validation_errors) : null
    flow.transaccion = Transacccion.ACTUALIZAR
    return this.flowRepository.save(flow)
  }

  /** Preview visual del formulario, sin necesidad de mandarlo por WhatsApp. */
  async obtenerPreviewUrl(id: string, clienteId: string): Promise<string> {
    const flow = await this.obtener(id, clienteId)
    const config = await this.waService.obtenerConfig(clienteId)
    const { preview_url } = await this.waService.obtenerPreviewFlowMeta(config, flow.metaFlowId!)
    return preview_url
  }

  async eliminar(id: string, clienteId: string, usuarioModificacion: string): Promise<void> {
    const flow = await this.obtener(id, clienteId)
    try {
      const config = await this.waService.obtenerConfig(clienteId)
      if (flow.estadoFlow === EstadoFlowWhatsapp.PUBLICADO) {
        await this.waService.deprecarFlowMeta(config, flow.metaFlowId!)
      } else {
        await this.waService.eliminarFlowMeta(config, flow.metaFlowId!)
      }
    } catch (err: any) {
      this.logger.warn(`No se pudo eliminar/deprecar el flow "${flow.nombre}" en Meta: ${err.message}`)
    }
    flow.estado = Status.ELIMINATE
    flow.transaccion = Transacccion.ELIMINAR
    flow.usuarioModificacion = usuarioModificacion
    await this.flowRepository.save(flow)
  }

  /** El screen id que usa enviarFlow — este service es la única fuente de verdad para ambos lados. */
  obtenerScreenId(): string {
    return SCREEN_ID
  }

  private validarCampos(campos: CampoFlow[]): void {
    if (!campos?.length) throw new BadRequestException('El flow necesita al menos un campo')
    const conOpciones: CampoFlow['tipo'][] = ['Dropdown', 'RadioButtonsGroup', 'CheckboxGroup']
    for (const campo of campos) {
      if (!campo.nombre?.trim() || !campo.etiqueta?.trim()) {
        throw new BadRequestException('Todos los campos necesitan nombre interno y etiqueta visible')
      }
      if (conOpciones.includes(campo.tipo) && !campo.opciones?.length) {
        throw new BadRequestException(`El campo "${campo.etiqueta}" (${campo.tipo}) necesita al menos una opción`)
      }
    }
  }

  /** Traduce nuestra lista simple de campos al flow_json que espera Meta. */
  private construirFlowJson(campos: CampoFlow[], screenTitle: string): string {
    const hijos: any[] = campos.map(campo => {
      const base: any = { type: campo.tipo, name: campo.nombre, label: campo.etiqueta, required: campo.requerido }
      if (campo.tipo === 'TextInput') base['input-type'] = campo.inputType || 'text'
      if (['Dropdown', 'RadioButtonsGroup', 'CheckboxGroup'].includes(campo.tipo)) {
        base['data-source'] = (campo.opciones || []).map(o => ({ id: o, title: o }))
      }
      return base
    })

    hijos.push({
      type: 'Footer',
      label: 'Enviar',
      'on-click-action': { name: 'complete', payload: {} },
    })

    const json = {
      // 5.1 es la versión más baja soportada hoy por la API real de Meta (confirmado empíricamente
      // el 2026-08-04 — 3.x/4.x ya fueron descontinuadas aunque los docs todavía las muestran de ejemplo).
      version: '5.1',
      screens: [
        {
          id: SCREEN_ID,
          title: screenTitle,
          terminal: true,
          success: true,
          data: {},
          layout: {
            type: 'SingleColumnLayout',
            children: [
              { type: 'Form', name: 'form', children: hijos },
            ],
          },
        },
      ],
    }
    return JSON.stringify(json)
  }
}
