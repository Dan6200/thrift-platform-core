// cspell:disable
import nodePostgres from 'pg'
import { retryConnection } from './utils/retry-connection.js'
import { knexOptions, pgOptions } from './postgres/options.js'
import pgQuery from './postgres/pg-query.js'
import pgGetClient from './postgres/pg-get-client.js'
import Knex from 'knex'

const { types } = nodePostgres
import { databaseContext, createDatabaseHandles } from './request-context.js'

const isWorker = process.env.CLOUDFLARE_WORKERS === 'true'
const nodeHandles = isWorker ? undefined : createDatabaseHandles()
const current = () => {
  const handles = databaseContext.getStore() ?? nodeHandles
  if (!handles)
    throw new Error('Database access requires an active Worker request context')
  return handles
}
const pool = new Proxy({} as nodePostgres.Pool, {
  get(_target, property) {
    const actual = current().pool
    const value = Reflect.get(actual, property)
    return typeof value === 'function' ? value.bind(actual) : value
  },
})

// handle error...
if (!isWorker) pool.on('error', retryConnection(pool))

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

export const knex = new Proxy(function () {} as unknown as Knex.Knex, {
  apply(_target, _thisArg, args) {
    return Reflect.apply(current().knex, current().knex, args)
  },
  get(_target, property) {
    const actual = current().knex
    const value = Reflect.get(actual, property)
    return typeof value === 'function' ? value.bind(actual) : value
  },
})
