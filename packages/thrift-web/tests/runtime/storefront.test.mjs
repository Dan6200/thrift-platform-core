import assert from 'node:assert/strict'
import test from 'node:test'

const api = process.env.SMOKE_API_URL
test('storefront can preflight authenticated cart requests without an account token', async () => {
  assert.ok(api, 'Set SMOKE_API_URL')
  const origin = 'https://web.thrift-commerce.workers.dev'
  const response = await fetch(`${api}/v1/cart`, {
    method: 'OPTIONS',
    headers: {
      Origin: origin,
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'authorization',
    },
  })
  assert.equal(response.status, 204)
  assert.equal(response.headers.get('access-control-allow-origin'), origin)
  assert.match(
    response.headers.get('access-control-allow-headers'),
    /authorization/i,
  )
})

test('public catalog filtering returns matching category rows and filtered counts', async () => {
  assert.ok(api, 'Set SMOKE_API_URL')
  const all = await fetch(`${api}/v1/products`).then((r) => r.json())
  const expected = all.products.filter((p) => p.category_name === 'Electronics')
  assert.ok(expected.length > 1)
  const response = await fetch(
    `${api}/v1/products?category=electronics&limit=1`,
  )
  assert.equal(response.status, 200)
  const body = await response.json()
  assert.equal(body.total_count, expected.length)
  assert.equal(body.products.length, 1)
  assert.equal(body.products[0].category_name, 'Electronics')
})
