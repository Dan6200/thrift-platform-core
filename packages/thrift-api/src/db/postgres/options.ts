import { connectionString } from './config.js'

const workerPoolSize = 3

export function createDbPoolConfig(isCloudflareWorkers: boolean) {
  return {
    knex: isCloudflareWorkers ? { min: 0, max: workerPoolSize } : undefined,
    pg: {
      max: isCloudflareWorkers ? workerPoolSize : undefined,
      idleTimeoutMillis: isCloudflareWorkers ? 10_000 : 0,
    },
  }
}

const dbPoolConfig = createDbPoolConfig(
  process.env.CLOUDFLARE_WORKERS === 'true',
)

export const knexOptions = {
  client: 'pg',
  connection: {
    connectionString,
  },
  ...(dbPoolConfig.knex ? { pool: dbPoolConfig.knex } : {}),
}

export const pgOptions = {
  connectionString,
  max: dbPoolConfig.pg.max,
  ssl: (process.env.NODE_ENV ?? '').includes('production')
    ? {
        rejectUnauthorized: false,
      }
    : false,
  idleTimeoutMillis: dbPoolConfig.pg.idleTimeoutMillis,
  connectionTimeoutMillis: 0,
}
