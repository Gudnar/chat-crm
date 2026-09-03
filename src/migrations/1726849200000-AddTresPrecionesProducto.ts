import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTresPrecionesProducto1726849200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE producto
      ADD COLUMN IF NOT EXISTS precio1 DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS precio2 DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS precio3 DECIMAL(10,2)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE producto
      DROP COLUMN IF EXISTS precio1,
      DROP COLUMN IF EXISTS precio2,
      DROP COLUMN IF EXISTS precio3
    `)
  }
}
