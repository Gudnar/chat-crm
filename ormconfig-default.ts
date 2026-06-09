import { DataSource } from 'typeorm'
import dotenv from 'dotenv'

dotenv.config()

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ide_ia_db',
  schema: process.env.DB_SCHEMA || 'public',
  synchronize: false,
  logging: process.env.LOG_SQL === 'true',
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/src/migrations/**/*{.ts,.js}'],
})
