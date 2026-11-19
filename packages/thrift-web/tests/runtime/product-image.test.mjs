import assert from 'node:assert/strict'
import test from 'node:test'

test('product page renders a current, loadable API image URL', async () => {
  const web = process.env.SMOKE_WEB_URL
  const api = process.env.SMOKE_API_URL
  assert.ok(web && api, 'Set SMOKE_WEB_URL and SMOKE_API_URL to the deployed services')
  const id = process.env.SMOKE_PRODUCT_ID ?? '82'
  const response = await fetch(`${api}/v1/products/${id}`, { signal: AbortSignal.timeout(20000) })
  assert.equal(response.status, 200)
  const product = await response.json()
  const image = product.media?.find(media => media.is_display_image) ?? product.media?.[0]
  assert.ok(image?.filepath, 'Product must have media for this smoke check')
  const page = await fetch(`${web}/products/${id}`, { signal: AbortSignal.timeout(20000) })
  assert.equal(page.status, 200)
  const html = await page.text()
  assert.ok(html.includes(image.filepath), 'Rendered page must contain the current API image URL')
  const asset = await fetch(image.filepath, { signal: AbortSignal.timeout(20000) })
  assert.equal(asset.status, 200)
  assert.match(asset.headers.get('content-type') ?? '', /^image\//)
})
