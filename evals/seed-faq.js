/**
 * Carga evals/faq-volt.md a la Base de Conocimiento de un agente.
 * Uso:    node evals/seed-faq.js <agenteId>
 * Es idempotente: actualiza por pregunta si ya existe, crea si no.
 * Requiere backend compilado (npm run build) y el .env con la BD.
 */
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const { DataSource } = require('typeorm')
const { BaseConocimiento } = require('../dist/src/core/base-conocimiento/entity/base-conocimiento.entity')

const agenteId = process.argv[2]
if (!agenteId) {
  console.error('Uso: node evals/seed-faq.js <agenteId>')
  process.exit(1)
}

function parsearFaq(md) {
  const entradas = []
  let categoria = null
  let pregunta = null
  let respuesta = []

  const cerrar = () => {
    if (pregunta && respuesta.length) {
      entradas.push({ categoria, pregunta, respuesta: respuesta.join('\n').trim() })
    }
    pregunta = null
    respuesta = []
  }

  for (const linea of md.split('\n')) {
    if (linea.startsWith('## Categoría:')) {
      cerrar()
      categoria = linea.replace('## Categoría:', '').trim()
    } else if (linea.startsWith('### ')) {
      cerrar()
      pregunta = linea.replace('### ', '').trim()
    } else if (pregunta && linea.trim() && !linea.startsWith('#') && !linea.startsWith('>')) {
      respuesta.push(linea.trim())
    }
  }
  cerrar()
  return entradas
}

async function main() {
  const md = fs.readFileSync(path.join(__dirname, 'faq-volt.md'), 'utf8')
  const entradas = parsearFaq(md)

  // Las respuestas con [CONFIRMAR] se cargan INACTIVAS: el agente no las usa
  // hasta que reemplaces la marca con el dato real y vuelvas a correr el seed.
  const pendientes = entradas.filter(e => e.respuesta.includes('[CONFIRMAR'))
  if (pendientes.length) {
    console.log(`⚠️  ${pendientes.length} de ${entradas.length} respuestas tienen [CONFIRMAR] → se cargan como INACTIVAS (el agente no las usará aún):`)
    for (const p of pendientes) console.log('   •', p.pregunta)
  }

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
  const repo = ds.getRepository(BaseConocimiento)

  let creadas = 0
  let actualizadas = 0
  let orden = 0
  for (const e of entradas) {
    orden++
    const activo = !e.respuesta.includes('[CONFIRMAR')
    const existente = await repo.findOne({ where: { agenteId, pregunta: e.pregunta, estado: 'ACTIVO' } })
    if (existente) {
      existente.respuesta = e.respuesta
      existente.categoria = e.categoria
      existente.orden = orden
      existente.activo = activo
      existente.transaccion = 'ACTUALIZAR'
      await repo.save(existente)
      actualizadas++
    } else {
      await repo.save(repo.create({
        agenteId,
        pregunta: e.pregunta,
        respuesta: e.respuesta,
        categoria: e.categoria,
        activo,
        orden,
        estado: 'ACTIVO',
        transaccion: 'CREAR',
        usuarioCreacion: '1',
      }))
      creadas++
    }
  }

  const activas = entradas.filter(e => !e.respuesta.includes('[CONFIRMAR')).length
  console.log(`✅ FAQ cargada al agente ${agenteId}: ${creadas} creadas, ${actualizadas} actualizadas — ${activas}/${entradas.length} activas para el agente`)
  await ds.destroy()
}

main().catch(e => { console.error('FALLO:', e.message); process.exit(1) })
