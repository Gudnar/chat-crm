import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm'
import { Cliente } from '../../cliente/entity/cliente.entity'
import { Usuario } from '../../usuario/entity/usuario.entity'
import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'

@Entity({ name: 'agente', schema: process.env.DB_SCHEMA || 'public' })
export class Agente extends AuditoriaEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string

  @Column({ name: 'nombre', length: 100 })
  nombre: string

  // ── Tipo de agente: 'ia' (Claude) o 'humano' (operador con credenciales) ──
  @Index()
  @Column({ name: 'tipo_agente', length: 20, default: 'ia' })
  tipoAgente: string

  // Solo agentes humanos: vínculo al usuario con credenciales de acceso
  @Index()
  @Column({ name: 'usuario_id', type: 'bigint', nullable: true })
  usuarioId: string | null

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuarioAcceso?: Usuario | null

  // Solo agentes humanos: disponibilidad operativa
  @Index()
  @Column({ name: 'estado_disponibilidad', length: 20, default: 'inactivo' })
  estadoDisponibilidad: string

  @Column({ name: 'sesion_activa', type: 'boolean', default: false })
  sesionActiva: boolean

  @Column({ name: 'ultimo_acceso', type: 'timestamptz', nullable: true })
  ultimoAcceso?: Date | null

  // Horario laboral: { "lunes": { "inicio": "09:00", "fin": "18:00" }, ... }
  @Column({ name: 'horas_trabajo', type: 'jsonb', default: '{}' })
  horasTrabajo: Record<string, { inicio: string; fin: string }>

  @Column({ name: 'especialidades', type: 'jsonb', default: '[]' })
  especialidades: string[]

  @Column({ name: 'descripcion', length: 500, nullable: true })
  descripcion?: string

  @Column({ name: 'modelo', length: 100, default: 'claude-haiku-4-5' })
  modelo: string

  @Column({ name: 'tono', length: 50, default: 'profesional' })
  tono: string

  @Column({ name: 'idioma', length: 20, default: 'español' })
  idioma: string

  @Column({ name: 'max_tokens', type: 'int', default: 256 })
  maxTokens: number

  @Column({ name: 'system_prompt', type: 'text', nullable: true })
  systemPrompt?: string

  @Column({ name: 'modo_operacion', length: 20, default: 'hybrid' })
  modoOperacion: string

  // ── Recordatorio automático: si una conversación queda "pendiente" sin que el
  // cliente mande foto ni ubicación, este agente puede reenviarle un mensaje solo
  // pasadas N horas (ver RecordatorioService, cron cada 15 min). ──
  @Column({ name: 'recordatorio_activo', type: 'boolean', default: false })
  recordatorioActivo: boolean

  @Column({ name: 'recordatorio_horas', type: 'int', default: 3 })
  recordatorioHoras: number

  @Column({ name: 'recordatorio_mensaje', type: 'text', nullable: true })
  recordatorioMensaje?: string

  // ── Recordatorio de cita agendada: avisa al cliente N horas antes de una llamada
  // ya confirmada con agendar_cita (ver RecordatorioCitaService). Si al momento de
  // mandar el aviso ya pasaron 24h desde el último mensaje del cliente, Meta exige
  // una plantilla aprobada en vez de texto libre — de ahí recordatorioCitaPlantillaId. ──
  @Column({ name: 'recordatorio_cita_activo', type: 'boolean', default: false })
  recordatorioCitaActivo: boolean

  @Column({ name: 'recordatorio_cita_horas', type: 'int', default: 2 })
  recordatorioCitaHoras: number

  @Column({ name: 'recordatorio_cita_mensaje', type: 'text', nullable: true })
  recordatorioCitaMensaje?: string

  @Column({ name: 'recordatorio_cita_plantilla_id', type: 'bigint', nullable: true })
  recordatorioCitaPlantillaId?: string | null

  /** Transcribe las notas de voz que manda el cliente (vía OpenAI Whisper) antes de pasarlas a Claude, que no acepta audio como input. */
  @Column({ name: 'transcribir_audios', type: 'boolean', default: false })
  transcribirAudios: boolean

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean

  @Column({ name: 'avatar', length: 10, default: '✦' })
  avatar: string

  @Column({ name: 'color', length: 20, default: '#6366f1' })
  color: string

  @Column({ name: 'total_conversaciones', type: 'int', default: 0 })
  totalConversaciones: number

  @Column({ name: 'total_mensajes', type: 'int', default: 0 })
  totalMensajes: number

  @Column({ name: 'cliente_id', type: 'bigint' })
  clienteId: string

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente

  constructor(data?: Partial<Agente>) {
    super(data)
    if (data) Object.assign(this, data)
  }
}
