import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { normalizeProductData } from './get-products'

describe('normalizeProductData', () => {
  it('normalizes legacy product prices before validating the API response', () => {
    const result = normalizeProductData({
      total_count: 1,
      products: [
        {
          product_id: 1,
          title: 'Test product',
          category_id: 1,
          category_name: 'Category',
          subcategory_id: 1,
          subcategory_name: 'Subcategory',
          vendor_id: 'vendor-1',
          store_id: 1,
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
          variants: [
            {
              variant_id: 1,
              sku: 'SKU-1',
              net_price: 123.45,
              quantity_available: 2,
              options: [],
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-01-01T00:00:00.000Z',
            },
          ],
        },
      ],
    })

    assert.equal(result.products[0]?.variants?.[0]?.base_price, 12345)
    assert.equal(result.total_count, 1)
  })

  it('returns an empty page for malformed API payloads', () => {
    assert.deepEqual(normalizeProductData({ products: null }), {
      products: [],
      total_count: 0,
    })
  })
})
