"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const typeorm_1 = require("@nestjs/typeorm");
const herramienta_entity_1 = require("./src/core/herramienta/entity/herramienta.entity");
const herramienta_defaults_1 = require("./src/core/herramienta/herramienta.defaults");
async function main() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, { logger: ['error', 'warn'] });
    const repo = app.get((0, typeorm_1.getRepositoryToken)(herramienta_entity_1.Herramienta));
    const nombresAActualizar = ['consultar_disponibilidad', 'agendar_cita'];
    for (const nombre of nombresAActualizar) {
        const def = herramienta_defaults_1.HERRAMIENTAS_DEFAULT.find(h => h.nombre === nombre);
        const filas = await repo.find({ where: { nombre } });
        console.log(`\n"${nombre}": ${filas.length} fila(s) encontradas en la BD`);
        for (const fila of filas) {
            fila.descripcion = def.descripcion;
            fila.parametros = def.parametros;
            fila.ejemplo = def.ejemplo;
            await repo.save(fila);
            console.log(`   ✓ agente_id=${fila.agenteId} actualizado`);
        }
    }
    console.log('\n✅ Listo — las tools existentes ya usan la nueva definición (parámetro "agente" por nombre).');
    await app.close();
    process.exit(0);
}
main().catch(err => {
    console.error('❌ ERROR:', err);
    process.exit(1);
});
//# sourceMappingURL=actualizar-tools-agendamiento.js.map