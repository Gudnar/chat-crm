/**
 * Suite de evaluación del agente Volt.
 * Replica EXACTAMENTE el flujo de producción (whatsapp-webhook):
 * system prompt + FAQ activas + herramientas del agente + catálogo real.
 *
 * Uso:  node evals/eval-volt.js [agenteId=6] [--solo <nombre-escenario>]
 * Regla de oro: ningún cambio al prompt se despliega sin que esta suite pase.
 */
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const axios = require('axios')
const { DataSource } = require('typeorm')
const { Producto } = require('../dist/src/core/producto/entity/producto.entity')
const { Herramienta } = require('../dist/src/core/herramienta/entity/herramienta.entity')
const { BaseConocimiento } = require('../dist/src/core/base-conocimiento/entity/base-conocimiento.entity')
const { Agente } = require('../dist/src/core/agente/entity/agente.entity')
const { ProductoService } = require('../dist/src/core/producto/service/producto.service')
const { HerramientaService } = require('../dist/src/core/herramienta/service/herramienta.service')
const { BaseConocimientoService } = require('../dist/src/core/base-conocimiento/service/base-conocimiento.service')
const ESCENARIOS = require('./escenarios')

const AGENTE_ID = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : '6'
const soloIdx = process.argv.indexOf('--solo')
const SOLO = soloIdx !== -1 ? process.argv[soloIdx + 1] : null
const MAX_ITER = 5
const MODELO = 'claude-haiku-4-5'
const MAX_TOKENS = 700

// Validaciones globales aplicadas a TODAS las respuestas
const FRASES_PROHIBIDAS_GLOBALES = [
  'un segundo', 'un momento', 'déjame buscar', 'dejame buscar', 'déjame revisar',
  'voy a revisar', 'voy a buscar', 'voy a verificar', 'estoy buscando', 'estoy consultando',
  'ahora te muestro', 'deberían llegar', 'http://', 'https://', '[confirmar', 'confirmar:',
  'herramienta', 'buscar_producto', 'system', 'catálogo interno',
]

async function main() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'crm_db',
    entities: [path.join(__dirname, '../dist/src/**/*.entity.js')],
    synchronize: false,
  })
  await ds.initialize()

  // Contexto igual que producción
  const agente = await ds.getRepository(Agente).findOne({ where: { id: AGENTE_ID } })
  if (!agente) throw new Error(`Agente ${AGENTE_ID} no existe`)
  const clienteId = String(agente.clienteId)

  const keyRow = await ds.query(
    "SELECT valor FROM configuracion_cliente WHERE cliente_id=$1 AND clave='ANTHROPIC_API_KEY'", [clienteId])
  const apiKey = keyRow[0]?.valor
  if (!apiKey) throw new Error('Sin ANTHROPIC_API_KEY para el cliente ' + clienteId)

  const productoSvc = new ProductoService(ds.getRepository(Producto), { get: () => null })
  const herrSvc = new HerramientaService(ds.getRepository(Herramienta))
  const faqSvc = new BaseConocimientoService(ds.getRepository(BaseConocimiento))

  const instrucciones = fs.readFileSync(path.join(__dirname, 'prompt-volt.md'), 'utf8')
  const faqContexto = await faqSvc.construirContexto(AGENTE_ID)
  const SYSTEM = faqContexto ? `${instrucciones}\n\n${faqContexto}` : instrucciones

  const herramientas = await herrSvc.listarPorAgente(AGENTE_ID)
  const tools = herrSvc.convertirAFormatoClaudeTools(herramientas)
  if (!tools.length) throw new Error('El agente no tiene herramientas — corre POST /api/herramientas/defaults/' + AGENTE_ID)

  const headers = { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }

  async function ejecutarTool(nombre, input, toolLog) {
    toolLog.push({ nombre, input })
    if (nombre === 'buscar_producto') {
      const productos = await productoSvc.buscar(clienteId, input.termino, input.categoria)
      let texto = productoSvc.formatearParaClaude(productos)
      const imagenes = productos.flatMap(p => productoSvc.resolverUrlsImagenes(p.imagenes || [])).slice(0, 3)
      if (productos.length > 0) {
        texto += imagenes.length
          ? `\n\n[Sistema: se adjuntaron ${imagenes.length} imagen(es) del producto al chat del cliente]`
          : '\n\n[Sistema: estos productos NO tienen imágenes cargadas — no se envió ninguna foto al cliente]'
      }
      return { texto, imagenes }
    }
    const mocks = {
      calificar_lead: `Lead calificado con score ${input.score}.`,
      cambiar_estado: `Estado actualizado a: ${input.estado}`,
      escalar_agente: `Conversación escalada. Prioridad: ${input.prioridad}`,
      crear_nota: 'Nota interna creada.',
    }
    return { texto: mocks[nombre] || 'ok', imagenes: [] }
  }

  async function llamarClaude(messages, toolLog) {
    const pendingImages = []
    for (let i = 0; i < MAX_ITER; i++) {
      const body = { model: MODELO, max_tokens: MAX_TOKENS, system: SYSTEM, messages, tools }
      const res = await axios.post('https://api.anthropic.com/v1/messages', body, { headers })
      const { stop_reason, content } = res.data
      if (stop_reason === 'end_turn') {
        const t = content.find(b => b.type === 'text' && b.text && b.text.trim())
        if (!t && i < MAX_ITER - 1) {
          // Turno mudo (solo herramientas): pedir al modelo que redacte — igual que el webhook
          const nudge = { type: 'text', text: '[Sistema: las acciones fueron registradas. Escribe AHORA tu respuesta de texto para el cliente.]' }
          const ultimo = messages[messages.length - 1]
          if (ultimo && ultimo.role === 'user') {
            if (Array.isArray(ultimo.content)) ultimo.content.push(nudge)
            else ultimo.content = [{ type: 'text', text: ultimo.content }, nudge]
          }
          continue
        }
        return { respuesta: t ? t.text : null, imagenes: pendingImages }
      }
      if (stop_reason === 'tool_use') {
        messages.push({ role: 'assistant', content })
        const results = []
        for (const block of content) {
          if (block.type !== 'tool_use') continue
          const r = await ejecutarTool(block.name, block.input, toolLog)
          if (r.imagenes.length) pendingImages.push(...r.imagenes)
          results.push({ type: 'tool_result', tool_use_id: block.id, content: r.texto })
        }
        messages.push({ role: 'user', content: results })
        continue
      }
      const t = content.find(b => b.type === 'text')
      return { respuesta: t ? t.text : null, imagenes: pendingImages, corte: stop_reason }
    }
    return { respuesta: null, imagenes: [], corte: 'max_iteraciones' }
  }

  // ── Ejecutar escenarios ──
  const escenarios = SOLO ? ESCENARIOS.filter(e => e.nombre === SOLO) : ESCENARIOS
  let pasan = 0
  const resumenFallas = []

  for (const esc of escenarios) {
    const messages = []
    const toolLog = []
    const respuestas = []
    const fallas = []

    for (const turno of esc.turnos) {
      messages.push({ role: 'user', content: turno })
      const out = await llamarClaude(messages, toolLog)
      const respuesta = out.respuesta || ''
      respuestas.push(respuesta)
      messages.push({ role: 'assistant', content: respuesta || '(sin respuesta)' })

      if (!out.respuesta) fallas.push(`sin respuesta al turno "${turno}" (corte: ${out.corte || '?'})`)
      const lower = respuesta.toLowerCase()
      for (const f of FRASES_PROHIBIDAS_GLOBALES) {
        if (lower.includes(f)) fallas.push(`frase prohibida global "${f}"`)
      }
      if (respuesta.length > 900) fallas.push(`respuesta de ${respuesta.length} caracteres (>900)`)
      const preguntas = (respuesta.match(/¿/g) || []).length
      if (preguntas > 1) fallas.push(`${preguntas} preguntas en un mensaje`)
      for (const rx of (esc.prohibeTexto || [])) {
        if (rx.test(respuesta)) fallas.push(`texto prohibido del escenario: ${rx}`)
      }
    }

    const ultima = respuestas[respuestas.length - 1] || ''
    for (const rx of (esc.esperaTexto || [])) {
      if (!rx.test(ultima)) fallas.push(`falta texto esperado en la última respuesta: ${rx}`)
    }
    const nombresTools = toolLog.map(t => t.nombre)
    for (const t of (esc.esperaTools || [])) {
      if (!nombresTools.includes(t)) fallas.push(`no llamó la herramienta esperada: ${t}`)
    }
    if (esc.ordenCierre) {
      const iN = nombresTools.lastIndexOf('crear_nota')
      const iC = nombresTools.lastIndexOf('calificar_lead')
      const iE = nombresTools.lastIndexOf('escalar_agente')
      if (iE === -1) fallas.push('nunca escaló')
      else {
        if (iN === -1 || iN > iE) fallas.push('crear_nota ausente o después de escalar')
        if (iC === -1 || iC > iE) fallas.push('calificar_lead ausente o después de escalar')
      }
    }

    const ok = fallas.length === 0
    if (ok) pasan++
    console.log(`${ok ? '✅' : '❌'} ${esc.nombre}  [tools: ${nombresTools.join(', ') || '—'}]`)
    if (!ok || SOLO) {
      esc.turnos.forEach((t, i) => {
        console.log(`     👤 ${t}`)
        console.log(`     🤖 ${(respuestas[i] || '(sin respuesta)').replace(/\n+/g, ' ⏎ ')}`)
      })
    }
    for (const f of fallas) {
      console.log(`     ⚠️  ${f}`)
      resumenFallas.push(`${esc.nombre}: ${f}`)
    }
  }

  console.log('════════════════════════════════════════════════')
  console.log(`RESULTADO: ${pasan}/${escenarios.length} escenarios pasan`)
  await ds.destroy()
  process.exit(pasan === escenarios.length ? 0 : 1)
}

main().catch(e => { console.error('FALLO:', e?.response?.data?.error?.message || e.message); process.exit(2) })
