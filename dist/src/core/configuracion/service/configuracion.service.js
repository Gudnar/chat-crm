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
var ConfiguracionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const configuracion_entity_1 = require("../entity/configuracion.entity");
const base_service_1 = require("../../../common/base/base-service");
const constants_1 = require("../../../common/constants");
const response_messages_1 = require("../../../common/constants/response-messages");
const axios_1 = __importDefault(require("axios"));
let ConfiguracionService = ConfiguracionService_1 = class ConfiguracionService extends base_service_1.BaseService {
    constructor(configuracionRepository) {
        super(ConfiguracionService_1.name);
        this.configuracionRepository = configuracionRepository;
    }
    async listar() {
        const configs = await this.configuracionRepository.find({ where: { estado: constants_1.Status.ACTIVE } });
        return configs.map(c => {
            if (c.esSecreto && c.valor) {
                return { ...c, valor: '••••••••••••••••' };
            }
            return c;
        });
    }
    async obtenerPorClave(clave) {
        return this.configuracionRepository.findOne({ where: { clave, estado: constants_1.Status.ACTIVE } });
    }
    async set(dto, usuarioCreacion) {
        const existe = await this.obtenerPorClave(dto.clave);
        if (existe) {
            Object.assign(existe, {
                valor: dto.valor,
                descripcion: dto.descripcion ?? existe.descripcion,
                esSecreto: dto.esSecreto ?? existe.esSecreto,
                transaccion: constants_1.Transacccion.ACTUALIZAR,
                usuarioModificacion: usuarioCreacion,
            });
            return this.configuracionRepository.save(existe);
        }
        const nueva = this.configuracionRepository.create({
            ...dto,
            estado: constants_1.Status.ACTIVE,
            transaccion: constants_1.Transacccion.CREAR,
            usuarioCreacion,
        });
        return this.configuracionRepository.save(nueva);
    }
    async verificarApiKey(dto) {
        const modelo = dto.modelo || 'claude-haiku-4-5';
        try {
            const res = await axios_1.default.post('https://api.anthropic.com/v1/messages', {
                model: modelo,
                max_tokens: 32,
                messages: [{ role: 'user', content: 'hola' }],
            }, {
                headers: {
                    'x-api-key': dto.apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                },
            });
            if (res.data?.content) {
                return { valida: true, mensaje: `${response_messages_1.Messages.API_KEY_VALID} Modelo: ${modelo}` };
            }
            return { valida: false, mensaje: response_messages_1.Messages.API_KEY_INVALID };
        }
        catch (error) {
            const msg = error?.response?.data?.error?.message || response_messages_1.Messages.API_KEY_INVALID;
            return { valida: false, mensaje: msg };
        }
    }
};
ConfiguracionService = ConfiguracionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(configuracion_entity_1.Configuracion)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ConfiguracionService);
exports.ConfiguracionService = ConfiguracionService;
//# sourceMappingURL=configuracion.service.js.map