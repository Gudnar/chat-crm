import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let mensaje = 'Error interno del servidor'
    let datos: any = null

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'string') {
        mensaje = exceptionResponse
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as any
        mensaje = res.message || res.mensaje || mensaje
        datos = res.datos || null
      }
    } else if (exception instanceof Error) {
      mensaje = exception.message
    }

    response.status(status).json({
      finalizado: false,
      mensaje,
      datos,
      timestamp: new Date().toISOString(),
      path: request.url,
    })
  }
}
