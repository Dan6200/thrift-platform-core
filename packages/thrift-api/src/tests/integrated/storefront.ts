import assert from 'node:assert/strict'
import chai from 'chai'
import chaiHttp from 'chai-http'

chai.use(chaiHttp)
export default function storefrontTests() {
  const origin = 'https://web.thrift-commerce.workers.dev'
  const request = () => chai.request(process.env.SERVER!)
  it('permits authenticated cart preflights from the storefront', async () => {
    const response = await request()
      .options('/v1/cart')
      .set('Origin', origin)
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'authorization')
    assert.equal(response.status, 204)
    assert.equal(response.headers['access-control-allow-origin'], origin)
    assert.match(
      response.headers['access-control-allow-headers'],
      /authorization/i,
    )
  })
  it('does not permit preflights from an untrusted origin', async () => {
    const response = await request()
      .options('/v1/cart')
      .set('Origin', 'https://untrusted.example')
      .set('Access-Control-Request-Method', 'POST')
    assert.equal(response.status, 403)
    assert.equal(response.headers['access-control-allow-origin'], undefined)
  })
  it('keeps authentication required and CORS headers on cart errors', async () => {
    const response = await request().get('/v1/cart').set('Origin', origin)
    assert.equal(response.status, 401)
    assert.equal(response.headers['access-control-allow-origin'], origin)
  })
  it('filters category products and counts before pagination', async () => {
    const all = await request().get('/v1/products')
    const expected = all.body.products.filter(
      (p: any) => p.category_name === 'Electronics',
    )
    assert.ok(expected.length > 1)
    const response = await request()
      .get('/v1/products')
      .query({ category: 'electronics', limit: 1 })
    assert.equal(response.status, 200)
    assert.equal(response.body.total_count, expected.length)
    assert.equal(response.body.products.length, 1)
    assert.equal(response.body.products[0].category_name, 'Electronics')
  })
  it('supports apostrophes in subcategory names and canonical slugs', async () => {
    for (const subcategory of ["Men's Fashion", 'mens-fashion']) {
      const response = await request()
        .get('/v1/products')
        .query({ subcategory })
      assert.equal(response.status, 200)
      assert.ok(response.body.products.length > 0)
      assert.ok(
        response.body.products.every(
          (p: any) => p.subcategory_name === "Men's Fashion",
        ),
      )
    }
  })
  it('combines category and subcategory filters without interpolating input', async () => {
    const response = await request()
      .get('/v1/products')
      .query({ category: 'electronics', subcategory: 'accessories' })
    assert.equal(response.status, 200)
    assert.ok(response.body.products.length > 0)
    assert.ok(
      response.body.products.every(
        (p: any) =>
          p.category_name === 'Electronics' &&
          p.subcategory_name === 'Accessories',
      ),
    )
    const absent = await request()
      .get('/v1/products')
      .query({ category: "x' OR 1=1 --" })
    assert.equal(absent.status, 200)
    assert.equal(absent.body.total_count, 0)
    assert.deepEqual(absent.body.products, [])
  })
}
