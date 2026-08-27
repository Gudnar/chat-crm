import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm'

export class CreateAgenteGoogleCalendarTable1726700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'agente_google_calendar',
        schema: 'public',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'agente_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'cliente_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'google_email',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'access_token',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'refresh_token',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'expira_en',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'calendar_id',
            type: 'varchar',
            length: '200',
            default: "'primary'",
            isNullable: false,
          },
          {
            name: 'sync_token',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'activo',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: '_estado',
            type: 'varchar',
            length: '50',
            default: "'ACTIVO'",
            isNullable: false,
          },
          {
            name: '_transaccion',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: '_usuario_creacion',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: '_fecha_creacion',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: '_usuario_modificacion',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: '_fecha_modificacion',
            type: 'timestamptz',
            isNullable: true,
          },
        ],
      }),
      true,
    )

    // Índice único en agente_id
    await queryRunner.createIndex(
      'agente_google_calendar',
      new TableIndex({
        name: 'idx_agente_google_calendar_agente_id_unique',
        columnNames: ['agente_id'],
        isUnique: true,
      }),
    )

    // Índice en cliente_id
    await queryRunner.createIndex(
      'agente_google_calendar',
      new TableIndex({
        name: 'idx_agente_google_calendar_cliente_id',
        columnNames: ['cliente_id'],
      }),
    )

    // Índice en activo
    await queryRunner.createIndex(
      'agente_google_calendar',
      new TableIndex({
        name: 'idx_agente_google_calendar_activo',
        columnNames: ['activo'],
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('agente_google_calendar')
  }
}
