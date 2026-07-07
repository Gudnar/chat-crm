"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = require("path");
const constants_1 = require("./common/constants");
dotenv_1.default.config();
const bootstrap = async () => {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log'],
    });
    const configService = app.get(config_1.ConfigService);
    app.enableCors({
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.use(helmet_1.default.hidePoweredBy());
    app.use((0, cookie_parser_1.default)());
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), { prefix: '/uploads' });
    app.use((req, _res, next) => {
        if (req.url === '/webhook' || req.url.startsWith('/webhook?')) {
            req.url = req.url.replace('/webhook', '/whatsapp/webhook');
        }
        next();
    });
    app.setGlobalPrefix(configService.get('PATH_SUBDOMAIN') || 'api', {
        exclude: [
            { path: 'whatsapp/webhook', method: common_1.RequestMethod.GET },
            { path: 'whatsapp/webhook', method: common_1.RequestMethod.POST },
            { path: 'red-social/webhook', method: common_1.RequestMethod.GET },
            { path: 'red-social/webhook', method: common_1.RequestMethod.POST },
        ],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true, whitelist: true }));
    createSwagger(app);
    const port = configService.get('PORT') || 3001;
    await app.listen(port);
    console.log(`[IDE-IA] Servidor iniciado en el puerto: ${port}`);
    console.log(`[IDE-IA] Swagger disponible en: http://localhost:${port}/api/docs`);
};
function createSwagger(app) {
    const options = new swagger_1.DocumentBuilder()
        .setTitle(constants_1.SWAGGER_API_NAME)
        .setDescription(constants_1.SWAGGER_API_DESCRIPTION)
        .setVersion(constants_1.SWAGGER_API_CURRENT_VERSION)
        .addServer('/api')
        .addBearerAuth({
        description: 'JWT Authorization',
        type: 'http',
        in: 'header',
        scheme: 'bearer',
        bearerFormat: 'JWT',
    }, 'defaultBearerAuth')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, options);
    swagger_1.SwaggerModule.setup(constants_1.SWAGGER_API_ROOT, app, document);
}
bootstrap();
//# sourceMappingURL=main.js.map