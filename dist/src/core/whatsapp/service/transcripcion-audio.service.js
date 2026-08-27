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
var TranscripcionAudioService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscripcionAudioService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const configuracion_cliente_service_1 = require("../../cliente/service/configuracion-cliente.service");
const OPENAI_TRANSCRIPTIONS_API = 'https://api.openai.com/v1/audio/transcriptions';
const EXTENSION_POR_MIME = {
    'audio/ogg': 'ogg',
    'audio/mpeg': 'mp3',
    'audio/amr': 'amr',
    'audio/aac': 'aac',
};
let TranscripcionAudioService = TranscripcionAudioService_1 = class TranscripcionAudioService {
    constructor(confClienteService) {
        this.confClienteService = confClienteService;
        this.logger = new common_1.Logger(TranscripcionAudioService_1.name);
    }
    async transcribir(buffer, mimeType, clienteId) {
        const apiKeyConfig = await this.confClienteService.obtenerPorClave(clienteId, 'OPENAI_API_KEY');
        const apiKey = apiKeyConfig?.valor;
        if (!apiKey || apiKey.includes('•'))
            return null;
        try {
            const base = (mimeType || '').split(';')[0].trim();
            const ext = EXTENSION_POR_MIME[base] || 'bin';
            const form = new form_data_1.default();
            form.append('file', buffer, { filename: `audio.${ext}`, contentType: base || 'application/octet-stream' });
            form.append('model', 'whisper-1');
            const { data } = await axios_1.default.post(OPENAI_TRANSCRIPTIONS_API, form, {
                headers: { Authorization: `Bearer ${apiKey}`, ...form.getHeaders() },
            });
            return data?.text?.trim() || null;
        }
        catch (err) {
            this.logger.error(`[Transcripcion] Falló la transcripción con OpenAI Whisper: ${err.message}`);
            return null;
        }
    }
};
TranscripcionAudioService = TranscripcionAudioService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [configuracion_cliente_service_1.ConfiguracionClienteService])
], TranscripcionAudioService);
exports.TranscripcionAudioService = TranscripcionAudioService;
//# sourceMappingURL=transcripcion-audio.service.js.map