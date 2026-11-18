import { AsyncLocalStorage } from 'node:async_hooks'
import nodePostgres from 'pg'
import Knex from 'knex'
import { knexOptions, pgOptions } from './postgres/options.js'

export const createDatabaseHandles = () => {
  const connectionString = workerCleanupContext.getStore()?.connectionString
  const connection = connectionString ? { connectionString } : {}
  const id = crypto.randomUUID()
  const pool = new nodePostgres.Pool({ ...pgOptions, ...connection })
  const knex = Knex({
    ...knexOptions,
    connection: { ...knexOptions.connection, ...connection },
  })
  if (process.env.CLOUDFLARE_WORKERS === 'true')
    knex.client.driver = nodePostgres
  pool.on('error', (error: Error) =>
    console.error(
      JSON.stringify({ event: 'request-db-pool-error', errorType: error.name }),
    ),
  )
  if (process.env.CLOUDFLARE_WORKERS === 'true') {
    const log = (event: string, extra = {}) =>
      console.log(JSON.stringify({ event, dbContextId: id, ...extra }))
    knex.client.pool.on(
      'createFail',
      (_eventId: number, error: Error & { code?: string }) =>
        log('db-connection-create-failed', {
          errorType: error.name,
          code: error.code ?? null,
        }),
    )
    knex.on('query', () => log('db-query-start'))
    knex.on('query-response', () => log('db-query-complete'))
    knex.on('query-error', (error: Error) =>
      log('db-query-error', { errorType: error.name }),
    )
    pool.on('connect', () => log('db-pg-connect'))
  }
  return { pool, knex, id }
}
export const databaseContext = new AsyncLocalStorage<
  ReturnType<typeof createDatabaseHandles>
>()
export async function withDatabaseRequest<T>(
  handler: () => Promise<T>,
): Promise<T> {
  const handles = createDatabaseHandles()
  return databaseContext.run(handles, async () => {
    try {
      return await handler()
    } finally {
      const results = await Promise.allSettled([
        handles.knex.destroy(),
        handles.pool.end(),
      ])
      if (process.env.CLOUDFLARE_WORKERS === 'true')
        console.log(
          JSON.stringify({
            event: 'db-cleanup',
            dbContextId: handles.id,
            complete: results.every((r) => r.status === 'fulfilled'),
          }),
        )
      for (const result of results)
        if (result.status === 'rejected') throw result.reason
    }
  })
}

export const workerCleanupContext = new AsyncLocalStorage<{
  connectionString: string
  waitUntil(promise: Promise<unknown>): void
}>()

export const workerRequests = new Map<
  string,
  { connectionString: string; waitUntil(promise: Promise<unknown>): void }
>()
