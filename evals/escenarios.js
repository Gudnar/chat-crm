/**
 * Escenarios de evaluación del agente Volt.
 * Cada escenario es una conversación independiente (memoria propia).
 *
 * Campos:
 *  - turnos: mensajes del cliente, en orden.
 *  - esperaTools: herramientas que DEBEN haberse llamado en algún momento.
 *  - esperaTexto: regex que la ÚLTIMA respuesta debe cumplir.
 *  - prohibeTexto: regex que NINGUNA respuesta debe contener (además de las globales).
 *  - ordenCierre: true → valida crear_nota antes de calificar_lead antes de escalar_agente.
 */
module.exports = [
  {
    nombre: 'saludo',
    turnos: ['Hola'],
  },
  {
    nombre: 'catalogo-completo',
    turnos: ['que autos tienen?'],
    esperaTools: ['buscar_producto'],
  },
  {
    nombre: 'una-sola-palabra',
    turnos: ['Toyota'],
    esperaTools: ['buscar_producto'],
  },
  {
    nombre: 'precio-modelo',
    turnos: ['cuanto cuesta el bz5?'],
    esperaTools: ['buscar_producto'],
    esperaTexto: [/\$\s?[\d.,]+/],
  },
  {
    nombre: 'modelo-inexistente',
    turnos: ['tienen el tesla model 3?'],
    esperaTools: ['buscar_producto'],
    esperaTexto: [/no encontr|no aparece|no est[áa]|no manejamos|no tenemos.*cat[áa]logo/i],
    prohibeTexto: [/no lo vendemos/i],
  },
  {
    nombre: 'fotos-producto-sin-imagenes',
    turnos: ['tienes fotos del dolphin?'],
    esperaTools: ['buscar_producto'],
    prohibeTexto: [/ah[íi] van|te las envi[eé]|ya te envi[eé]|reci[ée]n te mand|como puedes ver/i],
  },
  {
    nombre: 'ficha-tecnica-pdf',
    turnos: ['cuanto esta el bz5?', 'me puedes mandar la ficha tecnica en pdf?'],
    esperaTexto: [/asesor|caracter[íi]sticas|datos/i],
    prohibeTexto: [/te adjunto|aqu[íi] tienes el pdf|te lo env[íi]o|descarga/i],
  },
  {
    nombre: 'errores-de-tipeo',
    turnos: ['cuanto esta el toyta corola?'],
    esperaTools: ['buscar_producto'],
    prohibeTexto: [/no entend[íi]|escribiste mal|error de tipeo/i],
  },
  {
    nombre: 'memoria-presupuesto',
    turnos: [
      'hola, tengo 25000 dolares de presupuesto, que me recomiendas?',
      'mmm y algo con mas espacio para la familia?',
    ],
    esperaTools: ['buscar_producto'],
    prohibeTexto: [/¿[^?]*presupuesto[^?]*\?/i],
  },
  {
    nombre: 'broma-chicles',
    turnos: ['aceptan pago con chicles? jaja'],
  },
  {
    nombre: 'pago-usdt-sin-faq',
    turnos: ['puedo pagar con USDT?'],
    esperaTexto: [/asesor/i],
    prohibeTexto: [/s[íi], aceptamos usdt|no aceptamos usdt/i],
  },
  {
    nombre: 'objecion-dolar',
    turnos: ['me interesa el dolphin pero si sube el dolar el precio cambia no?'],
    esperaTexto: [/asesor|precio cerrado|confirma/i],
  },
  {
    nombre: 'donde-cargo',
    turnos: ['y donde cargo el auto? en mi casa no tengo nada especial'],
    esperaTexto: [/casa|domicili|enchufe|celular|noche/i],
  },
  {
    nombre: 'solo-mirando',
    turnos: ['solo estoy mirando nomas'],
    prohibeTexto: [/¿te agendo|¿te conecto|te llame|ll[áa]mada con.*asesor/i],
  },
  {
    nombre: 'cliente-molesto',
    turnos: ['ya les escribi ayer y NADIE me respondio, pesimo servicio la verdad'],
    esperaTexto: [/disculpa|lament|entiendo|sentimos|raz[óo]n/i],
  },
  {
    nombre: 'quiere-humano-directo',
    turnos: ['quiero hablar con una persona real por favor'],
    esperaTools: ['escalar_agente'],
    ordenCierre: true,
  },
  {
    nombre: 'comparacion-modelos',
    turnos: ['que es mejor, el dolphin o el bz3x?'],
    esperaTools: ['buscar_producto'],
    prohibeTexto: [/es mucho mejor|sin duda el|claramente superior/i],
  },
  {
    nombre: 'financiamiento-sin-faq',
    turnos: ['dan financiamiento? en cuantas cuotas?'],
    esperaTexto: [/asesor/i],
    prohibeTexto: [/\d+\s*%\s*(de\s*)?inter[eé]s|\d+\s*cuotas de/i],
  },
  {
    nombre: 'cierre-cotizacion-completo',
    turnos: [
      'hola, soy Marco de Santa Cruz',
      'cuanto esta el bz5 pro?',
      'me interesa, pasame una cotizacion formal porfa',
      'dale, mejor en la tarde',
    ],
    esperaTools: ['buscar_producto', 'crear_nota', 'calificar_lead', 'escalar_agente'],
    ordenCierre: true,
    prohibeTexto: [/¿.*n[úu]mero.*\?/i],
  },
  {
    nombre: 'despedida-sin-agendar',
    turnos: [
      'que precio tiene el dolphin mini?',
      'gracias, lo voy a pensar y te aviso',
    ],
    esperaTools: ['crear_nota'],
    prohibeTexto: [/¿est[áa]s seguro|una [úu]ltima oportunidad|no te lo pierdas/i],
  },
]
