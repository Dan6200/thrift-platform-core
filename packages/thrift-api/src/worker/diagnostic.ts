import {
  configureCloudflareRuntime,
  type CloudflareRuntimeBindings,
} from './runtime-config.js'

let isolateId: string | undefined
let invocation = 0
export default {
  async fetch(
    request: Request,
    bindings: CloudflareRuntimeBindings,
  ): Promise<Response> {
    configureCloudflareRuntime(bindings, process.env)
    isolateId ??= crypto.randomUUID()
    const sequence = ++invocation
    const requestId = crypto.randomUUID()
    const started = Date.now()
    const { withDatabaseRequest } = await import('../db/request-context.js')
    return withDatabaseRequest(async () => {
      const db = await import('../db/index.js')
      const stats = () => {
        const pool = db.knex.client.pool
        return {
          used: pool.numUsed(),
          free: pool.numFree(),
          pending: pool.numPendingAcquires(),
        }
      }
      const before = stats()
      let response: Response
      try {
        if (new URL(request.url).pathname === '/__db-check') {
          const result = await db.knex.raw('SELECT 1 AS ok')
          response = Response.json({ ok: result.rows[0]?.ok === 1 })
        } else {
          const worker = await import('../worker.js')
          response = await worker.default.fetch(request, bindings)
        }
      } catch (error) {
        console.error(
          JSON.stringify({
            event: 'db-diagnostic-error',
            requestId,
            isolateId,
            sequence,
            errorType: (error as Error).name,
          }),
        )
        response = Response.json(
          { error: 'diagnostic request failed' },
          { status: 500 },
        )
      }
      const elapsed = Date.now() - started
      console.log(
        JSON.stringify({
          event: 'db-diagnostic',
          requestId,
          isolateId,
          sequence,
          elapsed,
          status: response.status,
          before,
          after: stats(),
        }),
      )
      const headers = new Headers(response.headers)
      headers.set('x-db-isolate', isolateId)
      headers.set('x-db-sequence', String(sequence))
      headers.set('x-db-duration-ms', String(elapsed))
      headers.set('x-db-request-id', requestId)
      return new Response(response.body, { status: response.status, headers })
    })
  },
}
