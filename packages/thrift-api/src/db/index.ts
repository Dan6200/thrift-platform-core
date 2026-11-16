// cspell:disable
import nodePostgres from 'pg'
import { retryConnection } from './utils/retry-connection.js'
import { knexOptions, pgOptions } from './postgres/options.js'
import pgQuery from './postgres/pg-query.js'
import pgGetClient from './postgres/pg-get-client.js'
import Knex from 'knex'

const { Pool, types } = nodePostgres
const pool = new Pool(pgOptions)

// handle error...
pool.on('error', retryConnection(pool))

types.setTypeParser(23, function (val) {
  return parseInt(val, 10)
})

types.setTypeParser(1700, function (val) {
  return parseFloat(val)
})

export const pg = {
  async end(): Promise<void> {
    await pool.end()
  },
  query: function async(text?: string, values?: Array<any>, name?: string) {
    return pgQuery.call(this, pool, text, values, name)
  },
  getClient: function async() {
    return pgGetClient.call(this, pool)
  },
}

export const knex = Knex(knexOptions)

if (process.env.CLOUDFLARE_WORKERS === 'true') {
  // Wrangler bundles Knex's CommonJS `require('pg')` as a namespace object
  // without the Client constructor. Use the ESM pg import already used above.
  knex.client.driver = nodePostgres
}
