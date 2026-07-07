import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { INestApplication, RequestMethod, ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { join } from 'path'
import {
  SWAGGER_API_CURRENT_VERSION,
  SWAGGER_API_DESCRIPTION,
  SWAGGER_API_NAME,
  SWAGGER_API_ROOT,
} from './common/constants'

dotenv.config()

const bootstrap = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  })

  const configService = app.get(ConfigService)

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  })

  app.use(helmet.hidePoweredBy())
  app.use(cookieParser())

  // Servir archivos subidos (imágenes de productos, etc.)
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' })

  // Rewrite /webhook → /whatsapp/webhook so Meta can use the shorter URL
  app.use((req: any, _res: any, next: any) => {
    if (req.url === '/webhook' || req.url.startsWith('/webhook?')) {
      req.url = req.url.replace('/webhook', '/whatsapp/webhook')
    }
    next()
  })

  app.setGlobalPrefix(configService.get('PATH_SUBDOMAIN') || 'api', {
    exclude: [
      { path: 'whatsapp/webhook',  method: RequestMethod.GET  },
      { path: 'whatsapp/webhook',  method: RequestMethod.POST },
      { path: 'red-social/webhook', method: RequestMethod.GET  },
      { path: 'red-social/webhook', method: RequestMethod.POST },
    ],
  })
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))

  createSwagger(app)

  const port = configService.get('PORT') || 3001
  await app.listen(port)
  console.log(`[IDE-IA] Servidor iniciado en el puerto: ${port}`)
  console.log(`[IDE-IA] Swagger disponible en: http://localhost:${port}/api/docs`)
}

function createSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle(SWAGGER_API_NAME)
    .setDescription(SWAGGER_API_DESCRIPTION)
    .setVersion(SWAGGER_API_CURRENT_VERSION)
    .addServer('/api')
    .addBearerAuth(
      {
        description: 'JWT Authorization',
        type: 'http',
        in: 'header',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'defaultBearerAuth'
    )
    .build()

  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup(SWAGGER_API_ROOT, app, document)
}

bootstrap()
