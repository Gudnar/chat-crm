import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

export interface ComponenteHeaderPlantilla {
  tipo: 'text' | 'image' | 'video' | 'document'
  texto?: string
}

export interface ComponenteBodyPlantilla {
  texto: string
  ejemplos?: string[]
}

export interface ComponenteBotonPlantilla {
  tipo: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER'
  texto: string
  url?: string
  telefono?: string
}

export interface ComponentesPlantilla {
  header?: ComponenteHeaderPlantilla
  body: ComponenteBodyPlantilla
  footer?: string
  botones?: ComponenteBotonPlantilla[]
}

@Entity({ name: 'plantilla_whatsapp', schema: process.env.DB_SCHEMA || 'public' })
export class PlantillaWhatsapp extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  /** Debe coincidir exacto con el nombre registrado en Meta — snake_case, único por cliente+idioma. */
  @Column({ name: 'nombre', length: 100 })
  nombre: string

  @Column({ name: 'idioma', length: 10, default: 'es' })
  idioma: string

  @Column({ name: 'categoria', length: 20, default: 'UTILITY' })
  categoria: string

  @Column({ name: 'estado_plantilla', length: 20, default: 'pendiente_meta' })
  estadoPlantilla: string

  @Column({ name: 'motivo_rechazo', type: 'text', nullable: true })
  motivoRechazo?: string | null

  /** ID que devuelve Meta al crearla — se usa para consultar/sincronizar el estado. */
  @Column({ name: 'meta_template_id', type: 'varchar', length: 100, nullable: true })
  metaTemplateId?: string | null

  @Column({ name: 'componentes', type: 'jsonb' })
  componentes: ComponentesPlantilla
}
