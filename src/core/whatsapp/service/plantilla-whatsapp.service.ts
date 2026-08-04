import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PlantillaWhatsapp, ComponentesPlantilla } from '../entity/plantilla-whatsapp.entity'
import { CreatePlantillaWhatsappDto } from '../dto/plantilla-whatsapp.dto'
import { WhatsappService } from './whatsapp.service'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion, EstadoPlantillaWhatsapp } from '../../../common/constants'

const NOMBRE_VALIDO = /^[a-z0-9_]+$/

@Injectable()
export class PlantillaWhatsappService extends BaseService {
  constructor(
    @InjectRepository(PlantillaWhatsapp)
    private readonly plantillaRepository: Repository<PlantillaWhatsapp>,
    private readonly waService: WhatsappService,
  ) {
    super(PlantillaWhatsappService.name)
  }

  async listar(clienteId: string): Promise<PlantillaWhatsapp[]> {
    return this.plantillaRepository.find({
      where: { clienteId, estado: Status.ACTIVE },
      order: { fechaCreacion: 'DESC' },
    })
  }

  async obtener(id: string, clienteId: string): Promise<PlantillaWhatsapp> {
    const plantilla = await this.plantillaRepository.findOne({ where: { id, clienteId, estado: Status.ACTIVE } })
    if (!plantilla) throw new NotFoundException('Plantilla no encontrada')
    return plantilla
  }

  /** Crea la plantilla en Meta (queda PENDING) y guarda la fila local para hacerle seguimiento. */
  async crear(dto: CreatePlantillaWhatsappDto, clienteId: string, usuarioCreacion: string): Promise<PlantillaWhatsapp> {
    const nombre = dto.nombre.trim().toLowerCase()
    if (!NOMBRE_VALIDO.test(nombre)) {
      throw new BadRequestException('El nombre solo puede tener minúsculas, números y guion bajo (ej. "recordatorio_captura")')
    }
    if (!dto.componentes?.body?.texto?.trim()) {
      throw new BadRequestException('La plantilla necesita al menos el texto del body')
    }

    const idioma = dto.idioma || 'es'
    const config = await this.waService.obtenerConfig(clienteId)
    if (!config.wabaId || !config.accessToken) {
      throw new BadRequestException('Falta configurar WhatsApp (WABA ID / Access Token) antes de crear plantillas')
    }

    const payload = {
      name: nombre,
      category: dto.categoria,
      language: idioma,
      components: this.construirComponentesMeta(dto.componentes),
    }

    let metaTemplateId: string | undefined
    let estadoPlantilla = EstadoPlantillaWhatsapp.PENDIENTE_META
    try {
      const respuesta = await this.waService.crearPlantillaMeta(config, payload)
      metaTemplateId = respuesta.id
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err.message
      throw new BadRequestException(`Meta rechazó la creación de la plantilla: ${msg}`)
    }

    const plantilla = this.plantillaRepository.create({
      clienteId,
      nombre,
      idioma,
      categoria: dto.categoria,
      estadoPlantilla,
      metaTemplateId,
      componentes: dto.componentes,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.plantillaRepository.save(plantilla)
  }

  /** Consulta a Meta el estado real y actualiza la fila local — usado por el botón manual y, después, por el cron/webhook. */
  async sincronizarEstado(id: string, clienteId: string): Promise<PlantillaWhatsapp> {
    const plantilla = await this.obtener(id, clienteId)
    if (!plantilla.metaTemplateId) return plantilla

    const config = await this.waService.obtenerConfig(clienteId)
    const respuesta = await this.waService.consultarEstadoPlantillaMeta(config, plantilla.metaTemplateId)

    plantilla.estadoPlantilla = this.mapearEstadoMeta(respuesta.status) || plantilla.estadoPlantilla
    // Meta devuelve el string literal "NONE" (no vacío/null) cuando no hay motivo de rechazo.
    plantilla.motivoRechazo = respuesta.rejected_reason && respuesta.rejected_reason !== 'NONE' ? respuesta.rejected_reason : null
    plantilla.transaccion = Transacccion.ACTUALIZAR
    return this.plantillaRepository.save(plantilla)
  }

  /** Aplica el mapeo APPROVED/REJECTED/PENDING/PAUSED → estado local. Compartido por sincronizarEstado() y el webhook. */
  private mapearEstadoMeta(estadoMeta: string): string | undefined {
    const mapaEstados: Record<string, string> = {
      APPROVED: EstadoPlantillaWhatsapp.APROBADA,
      REJECTED: EstadoPlantillaWhatsapp.RECHAZADA,
      PENDING: EstadoPlantillaWhatsapp.PENDIENTE_META,
      PAUSED: EstadoPlantillaWhatsapp.PAUSADA,
    }
    return mapaEstados[estadoMeta]
  }

  /** Actualiza el estado local a partir del evento message_template_status_update del webhook de Meta. */
  async actualizarEstadoPorWebhook(clienteId: string, metaTemplateId: string, evento: string, motivo?: string): Promise<void> {
    const plantilla = await this.plantillaRepository.findOne({
      where: { clienteId, metaTemplateId, estado: Status.ACTIVE },
    })
    if (!plantilla) {
      this.logger.warn(`[WA] Webhook de plantilla ignorado: no existe metaTemplateId=${metaTemplateId} para clienteId=${clienteId}`)
      return
    }
    const nuevoEstado = this.mapearEstadoMeta(evento)
    if (!nuevoEstado) {
      this.logger.warn(`[WA] Webhook de plantilla con evento desconocido: ${evento}`)
      return
    }
    plantilla.estadoPlantilla = nuevoEstado
    plantilla.motivoRechazo = motivo && motivo !== 'NONE' ? motivo : null
    plantilla.transaccion = Transacccion.ACTUALIZAR
    await this.plantillaRepository.save(plantilla)
    this.logger.log(`[WA] Plantilla "${plantilla.nombre}" actualizada por webhook: ${evento}`)
  }

  /** Cron de respaldo: sincroniza cada 1h las plantillas que quedaron en pendiente_meta por si el webhook no llegó. */
  @Cron('0 * * * *')
  async cronSincronizarPendientes(): Promise<void> {
    const pendientes = await this.plantillaRepository.find({
      where: { estadoPlantilla: EstadoPlantillaWhatsapp.PENDIENTE_META, estado: Status.ACTIVE },
    })
    for (const plantilla of pendientes) {
      if (!plantilla.metaTemplateId) continue
      try {
        await this.sincronizarEstado(plantilla.id, plantilla.clienteId)
      } catch (err: any) {
        this.logger.warn(`[WA] Cron sync plantilla ${plantilla.id} falló: ${err.message}`)
      }
    }
  }

  async eliminar(id: string, clienteId: string, usuarioModificacion: string): Promise<void> {
    const plantilla = await this.obtener(id, clienteId)
    try {
      const config = await this.waService.obtenerConfig(clienteId)
      await this.waService.eliminarPlantillaMeta(config, plantilla.nombre)
    } catch (err: any) {
      this.logger.warn(`No se pudo eliminar la plantilla "${plantilla.nombre}" en Meta: ${err.message}`)
    }
    plantilla.estado = Status.ELIMINATE
    plantilla.transaccion = Transacccion.ELIMINAR
    plantilla.usuarioModificacion = usuarioModificacion
    await this.plantillaRepository.save(plantilla)
  }

  /** Traduce nuestra estructura simple de componentes al formato que espera la API de Meta. */
  private construirComponentesMeta(componentes: ComponentesPlantilla): any[] {
    const resultado: any[] = []

    if (componentes.header?.texto) {
      resultado.push({ type: 'HEADER', format: (componentes.header.tipo || 'text').toUpperCase(), text: componentes.header.texto })
    }

    const ejemplos = componentes.body.ejemplos?.length ? { example: { body_text: [componentes.body.ejemplos] } } : {}
    resultado.push({ type: 'BODY', text: componentes.body.texto, ...ejemplos })

    if (componentes.footer) {
      resultado.push({ type: 'FOOTER', text: componentes.footer })
    }

    if (componentes.botones?.length) {
      resultado.push({
        type: 'BUTTONS',
        buttons: componentes.botones.map(b => ({
          type: b.tipo,
          text: b.texto,
          ...(b.tipo === 'URL' ? { url: b.url } : {}),
          ...(b.tipo === 'PHONE_NUMBER' ? { phone_number: b.telefono } : {}),
        })),
      })
    }

    return resultado
  }
}
