import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import axios from 'axios'
import { RedSocialCuenta } from '../entity/red-social-cuenta.entity'
import { RedSocialPost } from '../entity/red-social-post.entity'
import {
  CreateCuentaRedSocialDto,
  UpdateCuentaRedSocialDto,
  CreateRedSocialPostDto,
  UpdateRedSocialPostDto,
} from '../dto/red-social.dto'
import { BaseService } from '../../../common/base/base-service'
import { Status, Transacccion } from '../../../common/constants'

const META_API_VERSION = 'v19.0'
const META_BASE = `https://graph.facebook.com/${META_API_VERSION}`

@Injectable()
export class RedSocialService extends BaseService {
  constructor(
    @InjectRepository(RedSocialCuenta)
    private readonly cuentaRepo: Repository<RedSocialCuenta>,
    @InjectRepository(RedSocialPost)
    private readonly postRepo: Repository<RedSocialPost>,
  ) {
    super(RedSocialService.name)
  }

  // ── Cuentas ──────────────────────────────────────────────────

  async listarCuentas(clienteId: string | null, plataforma?: string): Promise<RedSocialCuenta[]> {
    const where: any = { estado: Status.ACTIVE }
    if (clienteId) where.clienteId = clienteId
    if (plataforma) where.plataforma = plataforma
    const cuentas = await this.cuentaRepo.find({ where, order: { fechaCreacion: 'DESC' } })
    cuentas.forEach(c => {
      c.accessToken = c.accessToken ? '••••••••••••••••' : ''
      c.appSecret = c.appSecret ? '••••••••' : ''
    })
    return cuentas
  }

  async obtenerCuenta(id: string, clienteId: string | null): Promise<RedSocialCuenta> {
    const where: any = { id, estado: Status.ACTIVE }
    if (clienteId) where.clienteId = clienteId
    const cuenta = await this.cuentaRepo.findOne({ where })
    if (!cuenta) throw new NotFoundException('Cuenta de red social no encontrada')
    return cuenta
  }

  async crearCuenta(dto: CreateCuentaRedSocialDto, usuarioCreacion: string, clienteId: string): Promise<RedSocialCuenta> {
    const cuenta = this.cuentaRepo.create({
      ...dto,
      clienteId,
      enabled: dto.enabled ?? true,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    const saved = await this.cuentaRepo.save(cuenta)
    saved.accessToken = saved.accessToken ? '••••••••••••••••' : ''
    return saved
  }

  async actualizarCuenta(id: string, dto: UpdateCuentaRedSocialDto, usuarioModificacion: string, clienteId: string | null): Promise<RedSocialCuenta> {
    const where: any = { id, estado: Status.ACTIVE }
    if (clienteId) where.clienteId = clienteId
    const cuenta = await this.cuentaRepo.findOne({ where })
    if (!cuenta) throw new NotFoundException('Cuenta de red social no encontrada')
    // No sobreescribir token si viene vacío o con bullets
    const updates: Partial<RedSocialCuenta> = { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion }
    if (!dto.accessToken || dto.accessToken.includes('•')) delete updates.accessToken
    if (!dto.appSecret   || dto.appSecret.includes('•'))   delete updates.appSecret
    Object.assign(cuenta, updates)
    const saved = await this.cuentaRepo.save(cuenta)
    saved.accessToken = saved.accessToken ? '••••••••••••••••' : ''
    return saved
  }

  async eliminarCuenta(id: string, usuarioModificacion: string, clienteId: string): Promise<void> {
    const cuenta = await this.obtenerCuenta(id, clienteId)
    cuenta.estado = Status.ELIMINATE
    cuenta.transaccion = Transacccion.ELIMINAR
    cuenta.usuarioModificacion = usuarioModificacion
    await this.cuentaRepo.save(cuenta)
  }

  async obtenerCuentaRaw(id: string, clienteId: string | null): Promise<RedSocialCuenta | null> {
    const where: any = { id, estado: Status.ACTIVE }
    if (clienteId) where.clienteId = clienteId
    return this.cuentaRepo.findOne({ where })
  }

  async resolverCuentaPorPageId(pageId: string): Promise<RedSocialCuenta | null> {
    return this.cuentaRepo.findOne({ where: { pageId, estado: Status.ACTIVE } })
  }

  async resolverCuentaPorVerifyToken(verifyToken: string): Promise<RedSocialCuenta | null> {
    return this.cuentaRepo.findOne({ where: { verifyToken, estado: Status.ACTIVE } })
  }

  // ── Posts ────────────────────────────────────────────────────

  async listarPosts(clienteId: string | null, cuentaId?: string): Promise<RedSocialPost[]> {
    const where: any = { estado: Status.ACTIVE }
    if (clienteId) where.clienteId = clienteId
    if (cuentaId) where.cuentaId = cuentaId
    return this.postRepo.find({ where, order: { fechaCreacion: 'DESC' } })
  }

  async obtenerPost(id: string, clienteId: string | null): Promise<RedSocialPost> {
    const where: any = { id, estado: Status.ACTIVE }
    if (clienteId) where.clienteId = clienteId
    const post = await this.postRepo.findOne({ where })
    if (!post) throw new NotFoundException('Post no encontrado')
    return post
  }

  async crearPost(dto: CreateRedSocialPostDto, usuarioCreacion: string, clienteId: string): Promise<RedSocialPost> {
    const post = this.postRepo.create({
      ...dto,
      clienteId,
      enabled: dto.enabled ?? true,
      estado: Status.ACTIVE,
      transaccion: Transacccion.CREAR,
      usuarioCreacion,
    })
    return this.postRepo.save(post)
  }

  async actualizarPost(id: string, dto: UpdateRedSocialPostDto, usuarioModificacion: string, clienteId: string): Promise<RedSocialPost> {
    const post = await this.obtenerPost(id, clienteId)
    Object.assign(post, { ...dto, transaccion: Transacccion.ACTUALIZAR, usuarioModificacion })
    return this.postRepo.save(post)
  }

  async eliminarPost(id: string, usuarioModificacion: string, clienteId: string): Promise<void> {
    const post = await this.obtenerPost(id, clienteId)
    post.estado = Status.ELIMINATE
    post.transaccion = Transacccion.ELIMINAR
    post.usuarioModificacion = usuarioModificacion
    await this.postRepo.save(post)
  }

  async resolverPostPorPostId(postId: string, clienteId: string): Promise<RedSocialPost | null> {
    return this.postRepo.findOne({ where: { postId, clienteId, enabled: true, estado: Status.ACTIVE } })
  }

  async sincronizarPosts(
    cuentaId: string,
    clienteId: string | null,
    usuarioCreacion: string,
  ): Promise<{ sincronizados: number; actualizados: number }> {
    const whereC: any = { id: cuentaId, estado: Status.ACTIVE }
    if (clienteId) whereC.clienteId = clienteId
    const cuenta = await this.cuentaRepo.findOne({ where: whereC })
    if (!cuenta) throw new NotFoundException('Cuenta no encontrada')

    // Instagram usa /media, no /posts — solo sincronizamos Facebook por ahora
    if (cuenta.plataforma === 'instagram') {
      return { sincronizados: 0, actualizados: 0 }
    }

    // El clienteId real de los posts viene de la cuenta (no del usuario logueado)
    const postClienteId = cuenta.clienteId

    const fields = [
      'id', 'message', 'story', 'created_time', 'full_picture',
      'attachments{media_type,url,media}',
      'likes.summary(true)',
      'comments.limit(100).summary(true){id,message,from{id,name},created_time}',
      'shares',
    ].join(',')

    const res = await axios.get(`${META_BASE}/${cuenta.pageId}/posts`, {
      params: { fields, limit: 50, access_token: cuenta.accessToken },
    })

    const posts: any[] = res.data?.data || []
    let sincronizados = 0
    let actualizados = 0

    for (const p of posts) {
      const postIdFB = p.id as string
      const attachment = p.attachments?.data?.[0]
      const imageUrl: string | undefined =
        p.full_picture ||
        attachment?.media?.image?.src ||
        attachment?.url ||
        undefined
      const tipo: string = attachment?.media_type || 'post'
      const titulo: string = (p.message || p.story || postIdFB).slice(0, 490)
      const fechaPost: Date = new Date(p.created_time)
      const likes: number = p.likes?.summary?.total_count ?? 0
      const comentarios: number = p.comments?.summary?.total_count ?? 0
      const compartidos: number = p.shares?.count ?? 0
      const comentariosData = (p.comments?.data || []).map((c: any) => ({
        id: c.id,
        message: c.message || '',
        fromName: c.from?.name || 'Anónimo',
        fromId: c.from?.id || '',
        createdTime: c.created_time,
      }))

      const existing = await this.postRepo.findOne({
        where: { postId: postIdFB, clienteId: postClienteId, estado: Status.ACTIVE },
      })

      if (existing) {
        Object.assign(existing, {
          titulo,
          contenido: p.message || undefined,
          imageUrl,
          tipo,
          likes,
          comentarios,
          compartidos,
          fechaPost,
          comentariosData,
          transaccion: Transacccion.ACTUALIZAR,
          usuarioModificacion: usuarioCreacion,
        })
        await this.postRepo.save(existing)
        actualizados++
      } else {
        const nuevo = this.postRepo.create({
          plataforma: cuenta.plataforma,
          postId: postIdFB,
          titulo,
          contenido: p.message || undefined,
          imageUrl,
          tipo,
          likes,
          comentarios,
          compartidos,
          clienteId: postClienteId,
          fechaPost,
          comentariosData,
          cuentaId,
          enabled: true,
          estado: Status.ACTIVE,
          transaccion: Transacccion.CREAR,
          usuarioCreacion,
        })
        await this.postRepo.save(nuevo)
        sincronizados++
      }
    }

    return { sincronizados, actualizados }
  }

  // ── Meta Graph API helpers ────────────────────────────────────

  async testConexion(accessToken: string, pageId: string, plataforma: string): Promise<{ valida: boolean; info?: any; mensaje: string }> {
    try {
      const fields = plataforma === 'instagram'
        ? 'id,name,username,profile_picture_url'
        : 'id,name,fan_count,category,link'
      const res = await axios.get(`${META_BASE}/${pageId}`, {
        params: { fields, access_token: accessToken },
      })
      const d = res.data
      return {
        valida: true,
        info: d,
        mensaje: `✅ Conectado: ${d.name || d.username || pageId}`,
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err.message || 'Error de conexión'
      return { valida: false, mensaje: `❌ ${msg}` }
    }
  }

  async enviarMensajeDM(recipientId: string, text: string, accessToken: string): Promise<void> {
    await axios.post(
      `${META_BASE}/me/messages`,
      {
        recipient: { id: recipientId },
        message: { text },
        messaging_type: 'RESPONSE',
      },
      { params: { access_token: accessToken } },
    )
  }

  async responderComentarioFB(commentId: string, text: string, accessToken: string): Promise<void> {
    await axios.post(
      `${META_BASE}/${commentId}/comments`,
      { message: text },
      { params: { access_token: accessToken } },
    )
  }

  async responderComentarioIG(commentId: string, text: string, accessToken: string): Promise<void> {
    await axios.post(
      `${META_BASE}/${commentId}/replies`,
      { message: text },
      { params: { access_token: accessToken } },
    )
  }

  async fetchNombreComentarista(commentId: string, accessToken: string): Promise<string | null> {
    try {
      const res = await axios.get(`${META_BASE}/${commentId}`, {
        params: { fields: 'from{id,name},message', access_token: accessToken },
      })
      return res.data?.from?.name || null
    } catch (e: any) {
      return null
    }
  }

  async enriquecerNombresComentaristas(clienteId: string | null): Promise<{ actualizadas: number }> {
    const where: any = { plataforma: 'facebook', estado: Status.ACTIVE }
    if (clienteId) where.clienteId = clienteId
    const cuenta = await this.cuentaRepo.findOne({ where })
    if (!cuenta?.accessToken) return { actualizadas: 0 }

    const posts = await this.listarPosts(clienteId)
    const cuentaRaw = await this.obtenerCuentaRaw(cuenta.id, clienteId)
    if (!cuentaRaw?.accessToken) return { actualizadas: 0 }

    let actualizadas = 0
    for (const post of posts) {
      if (!post.comentariosData?.length) continue
      let postChanged = false
      for (const cm of post.comentariosData as any[]) {
        if (cm.fromName && cm.fromName !== 'Anónimo') continue
        // full comment ID: {postId}_{simpleId}  e.g. "122146662770729267_875438855238777"
        const fullId = cm.id || ''
        if (!fullId) continue
        const nombre = await this.fetchNombreComentarista(fullId, cuentaRaw.accessToken)
        if (nombre) {
          cm.fromName = nombre
          postChanged = true
        }
      }
      if (postChanged) {
        await this.postRepo.update(post.id, { comentariosData: post.comentariosData })
        actualizadas++
      }
    }
    return { actualizadas }
  }

  async enviarDMDesdeAgente(
    recipientId: string,
    texto: string,
    plataforma: string,
    clienteId: string | null,
  ): Promise<{ enviado: boolean; mensaje: string }> {
    const where: any = { plataforma, estado: Status.ACTIVE }
    if (clienteId) where.clienteId = clienteId
    const cuenta = await this.cuentaRepo.findOne({ where })
    if (!cuenta?.accessToken) {
      return { enviado: false, mensaje: `No hay cuenta ${plataforma} configurada con token` }
    }
    await this.enviarMensajeDM(recipientId, texto, cuenta.accessToken)
    return { enviado: true, mensaje: 'Mensaje enviado por ' + plataforma }
  }
}
