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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AuthenticationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const usuario_service_1 = require("../../usuario/service/usuario.service");
const text_service_1 = require("../../../common/lib/text.service");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
const base_service_1 = require("../../../common/base/base-service");
const dayjs_1 = __importDefault(require("dayjs"));
let AuthenticationService = AuthenticationService_1 = class AuthenticationService extends base_service_1.BaseService {
    constructor(usuarioService, jwtService) {
        super(AuthenticationService_1.name);
        this.usuarioService = usuarioService;
        this.jwtService = jwtService;
    }
    async validarUsuario(usuario, contrasenaBase64) {
        const respuesta = await this.usuarioService.buscarUsuario(usuario);
        if (!respuesta)
            return null;
        if (respuesta.estado === constants_1.Status.INACTIVE)
            throw new common_1.UnauthorizedException(response_messages_1.Messages.INACTIVE_USER);
        if (respuesta.estado === constants_1.Status.ELIMINATE)
            throw new common_1.UnauthorizedException(response_messages_1.Messages.ELIMINATE_USER);
        if (respuesta.intentos >= constants_1.Configurations.WRONG_LOGIN_LIMIT) {
            if (respuesta.fechaBloqueo && (0, dayjs_1.default)().isBefore((0, dayjs_1.default)(respuesta.fechaBloqueo))) {
                throw new common_1.UnauthorizedException(response_messages_1.Messages.USER_BLOCKED);
            }
            await this.usuarioService.actualizarDatosBloqueo(respuesta.id, null, null);
        }
        const pass = text_service_1.TextService.decodeBase64(contrasenaBase64);
        const valid = await text_service_1.TextService.compare(pass, respuesta.contrasena);
        if (!valid) {
            const intentos = (respuesta.intentos || 0) + 1;
            if (intentos >= constants_1.Configurations.WRONG_LOGIN_LIMIT) {
                const fecha = (0, dayjs_1.default)().add(constants_1.Configurations.MINUTES_LOGIN_LOCK, 'minute').toDate();
                await this.usuarioService.actualizarDatosBloqueo(respuesta.id, null, fecha);
            }
            else {
                await this.usuarioService.actualizarContadorBloqueos(respuesta.id, intentos);
            }
            throw new common_1.UnauthorizedException(response_messages_1.Messages.INVALID_USER_CREDENTIALS);
        }
        if (respuesta.intentos > 0) {
            await this.usuarioService.actualizarContadorBloqueos(respuesta.id, 0);
        }
        return { id: respuesta.id, roles: [respuesta.rol], clienteId: respuesta.clienteId ?? null };
    }
    async autenticar(user) {
        const userData = await this.usuarioService.buscarUsuarioId(user.id);
        const payload = { id: user.id, roles: user.roles, clienteId: user.clienteId ?? null };
        const access_token = this.jwtService.sign(payload);
        this.logger.log(`Usuario autenticado: ${user.id}`);
        return {
            data: { access_token, ...userData },
        };
    }
};
AuthenticationService = AuthenticationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [usuario_service_1.UsuarioService,
        jwt_1.JwtService])
], AuthenticationService);
exports.AuthenticationService = AuthenticationService;
//# sourceMappingURL=authentication.service.js.map