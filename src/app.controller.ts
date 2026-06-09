import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Estado')
@Controller('estado')
export class AppController {
  @Get()
  estado() {
    return {
      finalizado: true,
      mensaje: 'IDE-IA API en línea',
      datos: {
        servicio: 'ide-ia-backend',
        version: '1.0.0',
        entorno: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
      },
    }
  }
}
