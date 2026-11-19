import { expect } from 'chai'
import { readFileSync } from 'node:fs'
import { knex } from '../../../db/index.js'

export default () => {
  const seed = readFileSync('supabase/seed.sql', 'utf8')
  it('stores the electronics category anchor as 150000 naira in kobo', async () => {
    const expression = seed.split('SET base_price = (')[1]?.split('\n  );')[0]
    expect(expression).to.be.a('string')
    const result = await knex.raw(
      `WITH products(product_id, category_id) AS (VALUES (41, 1)), categories(category_id, category_name) AS (VALUES (1, 'Electronics')) SELECT (${expression}) AS kobo FROM (VALUES (41)) AS pv(product_id)`,
    )
    expect(Number(result.rows[0].kobo)).to.equal(15000000)
  })
  it('stores a 30000 naira storage modifier in kobo', async () => {
    const expression = seed
      .split('SET default_price_modifier = ')[1]
      ?.split(';')[0]
    expect(expression).to.be.a('string')
    const result = await knex.raw(
      `SELECT (${expression}) AS kobo FROM (VALUES ('256GB')) AS pov(value)`,
    )
    expect(Number(result.rows[0].kobo)).to.equal(3000000)
  })
}
