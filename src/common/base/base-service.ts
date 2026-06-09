import { Logger } from '@nestjs/common'

export abstract class BaseService {
  protected logger: Logger

  protected constructor(name: string) {
    this.logger = new Logger(name)
  }

  protected successResponse(datos: any, mensaje = 'OK') {
    return { finalizado: true, mensaje, datos }
  }

  protected errorResponse(mensaje: string, datos: any = null) {
    return { finalizado: false, mensaje, datos }
  }
}
