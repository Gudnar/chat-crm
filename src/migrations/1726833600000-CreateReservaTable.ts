import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class CreateReservaTable1726833600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'reserva',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'cliente_id', type: 'varchar', isNullable: false },
          { name: 'agente_id', type: 'varchar', isNullable: false },
          { name: 'conversacion_id', type: 'varchar', isNullable: true },
          { name: 'contacto_nombre', type: 'varchar', isNullable: true },
          { name: 'contacto_telefono', type: 'varchar', isNullable: true },
          { name: 'contacto_ubicacion', type: 'jsonb', isNullable: true },
          { name: 'tipo', type: 'varchar', isNullable: false },
          { name: 'modalidad', type: 'varchar', isNullable: true },
          { name: 'cantidad_valor', type: 'numeric', isNullable: true, precision: 10, scale: 2 },
          { name: 'cantidad_unidad', type: 'varchar', isNullable: true },
          { name: 'precio_unitario', type: 'numeric', isNullable: true, precision: 10, scale: 2 },
          { name: 'precio_total', type: 'numeric', isNullable: true, precision: 10, scale: 2 },
          { name: 'fecha_reserva', type: 'date', isNullable: true },
          { name: 'hora_reserva', type: 'time', isNullable: true },
          { name: 'duracion_minutos', type: 'integer', isNullable: true },
          { name: 'prioridad', type: 'varchar', isNullable: true, default: "'media'" },
          { name: 'estado', type: 'varchar', isNullable: false, default: "'pendiente_confirmacion'" },
          { name: 'notas', type: 'text', isNullable: true },
          { name: 'foto_url', type: 'varchar', isNullable: true },
          { name: 'atributos_custom', type: 'jsonb', isNullable: true },
          // Auditoría
          { name: '_estado', type: 'varchar', isNullable: false, default: "'ACTIVO'" },
          { name: '_transaccion', type: 'varchar', isNullable: true },
          { name: '_usuario_creacion', type: 'varchar', isNullable: false },
          { name: '_fecha_creacion', type: 'timestamp', isNullable: false, default: 'NOW()' },
          { name: '_usuario_modificacion', type: 'varchar', isNullable: true },
          { name: '_fecha_modificacion', type: 'timestamp', isNullable: true },
          { name: '_usuario_eliminacion', type: 'varchar', isNullable: true },
          { name: '_fecha_eliminacion', type: 'timestamp', isNullable: true },
        ],
        indices: [
          { columnNames: ['cliente_id'] },
          { columnNames: ['agente_id'] },
          { columnNames: ['conversacion_id'] },
          { columnNames: ['tipo'] },
          { columnNames: ['estado'] },
          { columnNames: ['fecha_reserva'] },
          { columnNames: ['cliente_id', 'agente_id'] },
          { columnNames: ['cliente_id', 'fecha_reserva'] },
        ],
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('reserva')
  }
}
