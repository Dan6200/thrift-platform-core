import chai from 'chai'
import { createDbPoolConfig } from '../../../db/postgres/options.js'

const { expect } = chai

export default () => {
  it('bounds both Postgres pools for a Cloudflare Worker isolate', () => {
    expect(createDbPoolConfig(true)).to.deep.equal({
      knex: { min: 0, max: 3 },
      pg: { max: 3, idleTimeoutMillis: 10_000 },
    })
  })

  it('leaves the Node server pool defaults unchanged', () => {
    expect(createDbPoolConfig(false)).to.deep.equal({
      knex: undefined,
      pg: { max: undefined, idleTimeoutMillis: 0 },
    })
  })
}
