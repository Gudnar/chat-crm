export class SuccessResponseDto {
  finalizado: boolean
  mensaje: string
  datos: any

  constructor(datos: any, mensaje = 'OK') {
    this.finalizado = true
    this.mensaje = mensaje
    this.datos = datos
  }
}
