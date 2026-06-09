"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedSocialService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedSocialService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const axios_1 = __importDefault(require("axios"));
const red_social_cuenta_entity_1 = require("../entity/red-social-cuenta.entity");
const red_social_post_entity_1 = require("../entity/red-social-post.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
const META_API_VERSION = 'v19.0';
const META_BASE = `https://graph.facebook.com/${META_API_VERSION}`;
let RedSocialService = RedSocialService_1 = class RedSocialService extends base_service_1.BaseService {
    constructor(cuentaRepo, postRepo) {
        super(RedSocialService_1.name);
        this.cuentaRepo = cuentaRepo;
        this.postRepo = postRepo;
    }
    async listarCuentas(clienteId, plataforma) {
        const where = { estado: constants_1.Status.ACTIVE };
        if (clienteId)
            where.clienteId = clienteId;
        if (plataforma)
            where.plataforma = plataforma;
        const cuentas = await this.cuentaRepo.find({ where, order: { fechaCreacion: 'DESC' } });
        cuentas.forEach(c => {
            c.accessToken = c.accessToken ? '••••••••••••••••' : '';
            c.appSecret = c.appSecret ? '••••••••' : '';
        });
        return cuentas;
    }
    async obtenerCuenta(id, clienteId) {
        const where = { id, estado: constants_1.Status.ACTIVE };
        if (clienteId)
            where.clienteId = clienteId;
        const cuenta = await this.cuentaRepo.findOne({ where });
        if (!cuenta)
            throw new common_1.NotFoundException('Cuenta de red social no encontrada');
        return cuenta;
    }
    async crearCuenta(dto, usuarioCreacion, clienteId) {
        const cuenta = this.cuentaRepo.create({
            ...dto,
            clienteId,
            enabled: dto.enabled ?? true,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        const saved = await this.cuentaRepo.save(cuenta);
        saved.accessToken = saved.accessToken ? '••••••••••••••••' : '';
        return saved;
    }
    async actualizarCuenta(id, dto, usuarioModificacion, clienteId) {
        const where = { id, estado: constants_1.Status.ACTIVE };
        if (clienteId)
            where.clienteId = clienteId;
        const cuenta = await this.cuentaRepo.findOne({ where });
        if (!cuenta)
            throw new common_1.NotFoundException('Cuenta de red social no encontrada');
        const updates = { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion };
        if (!dto.accessToken || dto.accessToken.includes('•'))
            delete updates.accessToken;
        if (!dto.appSecret || dto.appSecret.includes('•'))
            delete updates.appSecret;
        Object.assign(cuenta, updates);
        const saved = await this.cuentaRepo.save(cuenta);
        saved.accessToken = saved.accessToken ? '••••••••••••••••' : '';
        return saved;
    }
    async eliminarCuenta(id, usuarioModificacion, clienteId) {
        const cuenta = await this.obtenerCuenta(id, clienteId);
        cuenta.estado = constants_1.Status.ELIMINATE;
        cuenta.transaccion = constants_1.Transacccion.ELIMINAR;
        cuenta.usuarioModificacion = usuarioModificacion;
        await this.cuentaRepo.save(cuenta);
    }
    async obtenerCuentaRaw(id, clienteId) {
        const where = { id, estado: constants_1.Status.ACTIVE };
        if (clienteId)
            where.clienteId = clienteId;
        return this.cuentaRepo.findOne({ where });
    }
    async resolverCuentaPorPageId(pageId) {
        return this.cuentaRepo.findOne({ where: { pageId, estado: constants_1.Status.ACTIVE } });
    }
    async resolverCuentaPorVerifyToken(verifyToken) {
        return this.cuentaRepo.findOne({ where: { verifyToken, estado: constants_1.Status.ACTIVE } });
    }
    async listarPosts(clienteId, cuentaId) {
        const where = { estado: constants_1.Status.ACTIVE };
        if (clienteId)
            where.clienteId = clienteId;
        if (cuentaId)
            where.cuentaId = cuentaId;
        return this.postRepo.find({ where, order: { fechaCreacion: 'DESC' } });
    }
    async obtenerPost(id, clienteId) {
        const where = { id, estado: constants_1.Status.ACTIVE };
        if (clienteId)
            where.clienteId = clienteId;
        const post = await this.postRepo.findOne({ where });
        if (!post)
            throw new common_1.NotFoundException('Post no encontrado');
        return post;
    }
    async crearPost(dto, usuarioCreacion, clienteId) {
        const post = this.postRepo.create({
            ...dto,
            clienteId,
            enabled: dto.enabled ?? true,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.postRepo.save(post);
    }
    async actualizarPost(id, dto, usuarioModificacion, clienteId) {
        const post = await this.obtenerPost(id, clienteId);
        Object.assign(post, { ...dto, transaccion: constants_1.Transacccion.ACTUALIZAR, usuarioModificacion });
        return this.postRepo.save(post);
    }
    async eliminarPost(id, usuarioModificacion, clienteId) {
        const post = await this.obtenerPost(id, clienteId);
        post.estado = constants_1.Status.ELIMINATE;
        post.transaccion = constants_1.Transacccion.ELIMINAR;
        post.usuarioModificacion = usuarioModificacion;
        await this.postRepo.save(post);
    }
    async resolverPostPorPostId(postId, clienteId) {
        return this.postRepo.findOne({ where: { postId, clienteId, enabled: true, estado: constants_1.Status.ACTIVE } });
    }
    async sincronizarPosts(cuentaId, clienteId, usuarioCreacion) {
        const whereC = { id: cuentaId, estado: constants_1.Status.ACTIVE };
        if (clienteId)
            whereC.clienteId = clienteId;
        const cuenta = await this.cuentaRepo.findOne({ where: whereC });
        if (!cuenta)
            throw new common_1.NotFoundException('Cuenta no encontrada');
        if (cuenta.plataforma === 'instagram') {
            return { sincronizados: 0, actualizados: 0 };
        }
        const postClienteId = cuenta.clienteId;
        const fields = [
            'id', 'message', 'story', 'created_time', 'full_picture',
            'attachments{media_type,url,media}',
            'likes.summary(true)',
            'comments.limit(100).summary(true){id,message,from{id,name},created_time}',
            'shares',
        ].join(',');
        const res = await axios_1.default.get(`${META_BASE}/${cuenta.pageId}/posts`, {
            params: { fields, limit: 50, access_token: cuenta.accessToken },
        });
        const posts = res.data?.data || [];
        let sincronizados = 0;
        let actualizados = 0;
        for (const p of posts) {
            const postIdFB = p.id;
            const attachment = p.attachments?.data?.[0];
            const imageUrl = p.full_picture ||
                attachment?.media?.image?.src ||
                attachment?.url ||
                undefined;
            const tipo = attachment?.media_type || 'post';
            const titulo = (p.message || p.story || postIdFB).slice(0, 490);
            const fechaPost = new Date(p.created_time);
            const likes = p.likes?.summary?.total_count ?? 0;
            const comentarios = p.comments?.summary?.total_count ?? 0;
            const compartidos = p.shares?.count ?? 0;
            const comentariosData = (p.comments?.data || []).map((c) => ({
                id: c.id,
                message: c.message || '',
                fromName: c.from?.name || 'Anónimo',
                fromId: c.from?.id || '',
                createdTime: c.created_time,
            }));
            const existing = await this.postRepo.findOne({
                where: { postId: postIdFB, clienteId: postClienteId, estado: constants_1.Status.ACTIVE },
            });
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
                    transaccion: constants_1.Transacccion.ACTUALIZAR,
                    usuarioModificacion: usuarioCreacion,
                });
                await this.postRepo.save(existing);
                actualizados++;
            }
            else {
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
                    estado: constants_1.Status.ACTIVE,
                    transaccion: constants_1.Transacccion.CREAR,
                    usuarioCreacion,
                });
                await this.postRepo.save(nuevo);
                sincronizados++;
            }
        }
        return { sincronizados, actualizados };
    }
    async testConexion(accessToken, pageId, plataforma) {
        try {
            const fields = plataforma === 'instagram'
                ? 'id,name,username,profile_picture_url'
                : 'id,name,fan_count,category,link';
            const res = await axios_1.default.get(`${META_BASE}/${pageId}`, {
                params: { fields, access_token: accessToken },
            });
            const d = res.data;
            return {
                valida: true,
                info: d,
                mensaje: `✅ Conectado: ${d.name || d.username || pageId}`,
            };
        }
        catch (err) {
            const msg = err?.response?.data?.error?.message || err.message || 'Error de conexión';
            return { valida: false, mensaje: `❌ ${msg}` };
        }
    }
    async enviarMensajeDM(recipientId, text, accessToken) {
        await axios_1.default.post(`${META_BASE}/me/messages`, {
            recipient: { id: recipientId },
            message: { text },
            messaging_type: 'RESPONSE',
        }, { params: { access_token: accessToken } });
    }
    async responderComentarioFB(commentId, text, accessToken) {
        await axios_1.default.post(`${META_BASE}/${commentId}/comments`, { message: text }, { params: { access_token: accessToken } });
    }
    async responderComentarioIG(commentId, text, accessToken) {
        await axios_1.default.post(`${META_BASE}/${commentId}/replies`, { message: text }, { params: { access_token: accessToken } });
    }
    async fetchNombreComentarista(commentId, accessToken) {
        try {
            const res = await axios_1.default.get(`${META_BASE}/${commentId}`, {
                params: { fields: 'from{id,name},message', access_token: accessToken },
            });
            return res.data?.from?.name || null;
        }
        catch (e) {
            return null;
        }
    }
    async enriquecerNombresComentaristas(clienteId) {
        const where = { plataforma: 'facebook', estado: constants_1.Status.ACTIVE };
        if (clienteId)
            where.clienteId = clienteId;
        const cuenta = await this.cuentaRepo.findOne({ where });
        if (!cuenta?.accessToken)
            return { actualizadas: 0 };
        const posts = await this.listarPosts(clienteId);
        const cuentaRaw = await this.obtenerCuentaRaw(cuenta.id, clienteId);
        if (!cuentaRaw?.accessToken)
            return { actualizadas: 0 };
        let actualizadas = 0;
        for (const post of posts) {
            if (!post.comentariosData?.length)
                continue;
            let postChanged = false;
            for (const cm of post.comentariosData) {
                if (cm.fromName && cm.fromName !== 'Anónimo')
                    continue;
                const fullId = cm.id || '';
                if (!fullId)
                    continue;
                const nombre = await this.fetchNombreComentarista(fullId, cuentaRaw.accessToken);
                if (nombre) {
                    cm.fromName = nombre;
                    postChanged = true;
                }
            }
            if (postChanged) {
                await this.postRepo.update(post.id, { comentariosData: post.comentariosData });
                actualizadas++;
            }
        }
        return { actualizadas };
    }
    async enviarDMDesdeAgente(recipientId, texto, plataforma, clienteId) {
        const where = { plataforma, estado: constants_1.Status.ACTIVE };
        if (clienteId)
            where.clienteId = clienteId;
        const cuenta = await this.cuentaRepo.findOne({ where });
        if (!cuenta?.accessToken) {
            return { enviado: false, mensaje: `No hay cuenta ${plataforma} configurada con token` };
        }
        await this.enviarMensajeDM(recipientId, texto, cuenta.accessToken);
        return { enviado: true, mensaje: 'Mensaje enviado por ' + plataforma };
    }
};
RedSocialService = RedSocialService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(red_social_cuenta_entity_1.RedSocialCuenta)),
    __param(1, (0, typeorm_1.InjectRepository)(red_social_post_entity_1.RedSocialPost)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RedSocialService);
exports.RedSocialService = RedSocialService;
//# sourceMappingURL=red-social.service.js.map