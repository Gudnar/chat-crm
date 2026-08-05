import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

export type TipoCampoFlow = 'TextInput' | 'TextArea' | 'DatePicker' | 'Dropdown' | 'RadioButtonsGroup' | 'CheckboxGroup'

export interface CampoFlow {
  tipo: TipoCampoFlow
  nombre: string
  etiqueta: string
  requerido: boolean
  opciones?: string[]
  inputType?: 'text' | 'email' | 'phone' | 'number'
}

@Entity({ name: 'flow_whatsapp', schema: process.env.DB_SCHEMA || 'public' })
export class FlowWhatsapp extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  /** Nombre interno — el agente lo usa para elegir qué flow mandar (mismo patrón que enviar_recurso). */
  @Column({ name: 'nombre', length: 100 })
  nombre: string

  @Column({ name: 'categoria', length: 30, default: 'OTHER' })
  categoria: string

  @Column({ name: 'estado_flow', length: 20, default: 'borrador' })
  estadoFlow: string

  /** ID que devuelve Meta al crearlo — se usa para publicar/sincronizar/enviar. */
  @Column({ name: 'meta_flow_id', type: 'varchar', length: 100, nullable: true })
  metaFlowId?: string | null

  @Column({ name: 'errores_validacion', type: 'text', nullable: true })
  erroresValidacion?: string | null

  /** Texto del botón que dispara el flow. */
  @Column({ name: 'cta', length: 20, default: 'Comenzar' })
  cta: string

  /** Cuerpo del mensaje que acompaña el botón. */
  @Column({ name: 'mensaje_cuerpo', type: 'text' })
  mensajeCuerpo: string

  @Column({ name: 'screen_title', length: 100, default: 'Formulario' })
  screenTitle: string

  /** Fuente de verdad — el flow_json de Meta se regenera a partir de esto, nunca se edita a mano. */
  @Column({ name: 'campos', type: 'jsonb' })
  campos: CampoFlow[]
}
