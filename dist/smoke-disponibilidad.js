"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const producto_service_1 = require("./src/core/producto/service/producto.service");
const USUARIO_SISTEMA = '1';
const CLIENTE_ID = '3';
async function main() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, { logger: ['error', 'warn'] });
    const productoService = app.get(producto_service_1.ProductoService);
    const manana = new Date();
    manana.setDate(manana.getDate() + 5);
    const fechaFutura = manana.toISOString().slice(0, 10);
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 5);
    const fechaPasada = ayer.toISOString().slice(0, 10);
    console.log('1) Creando producto CON fecha futura (aún no debe estar disponible)...');
    const pFuturo = await productoService.crear({ nombre: 'Producto Test Futuro', precio: 100, stock: 20, fechaDisponibilidad: fechaFutura }, CLIENTE_ID, USUARIO_SISTEMA);
    console.log('   ' + productoService.formatearParaClaude([pFuturo]).split('\n').find(l => l.includes('Disponibilidad')));
    console.log('\n2) Creando producto CON fecha pasada + stock (debe estar disponible)...');
    const pDisponible = await productoService.crear({ nombre: 'Producto Test Disponible', precio: 100, stock: 10, fechaDisponibilidad: fechaPasada }, CLIENTE_ID, USUARIO_SISTEMA);
    console.log('   ' + productoService.formatearParaClaude([pDisponible]).split('\n').find(l => l.includes('Disponibilidad')));
    console.log('\n3) Creando producto CON fecha pasada pero SIN stock (agotado)...');
    const pAgotado = await productoService.crear({ nombre: 'Producto Test Agotado', precio: 100, stock: 0, fechaDisponibilidad: fechaPasada }, CLIENTE_ID, USUARIO_SISTEMA);
    console.log('   ' + productoService.formatearParaClaude([pAgotado]).split('\n').find(l => l.includes('Disponibilidad')));
    console.log('\n4) Creando producto SIN fecha (comportamiento legacy, debe seguir igual)...');
    const pSinFecha = await productoService.crear({ nombre: 'Producto Test Sin Fecha', precio: 100, stock: 5 }, CLIENTE_ID, USUARIO_SISTEMA);
    console.log('   ' + productoService.formatearParaClaude([pSinFecha]).split('\n').find(l => l.includes('Disponibilidad')));
    for (const p of [pFuturo, pDisponible, pAgotado, pSinFecha]) {
        await productoService.eliminar(p.id, CLIENTE_ID, USUARIO_SISTEMA);
    }
    console.log('\n✅ Prueba completada y datos de prueba eliminados.');
    await app.close();
    process.exit(0);
}
main().catch(err => {
    console.error('❌ ERROR:', err);
    process.exit(1);
});
//# sourceMappingURL=smoke-disponibilidad.js.map