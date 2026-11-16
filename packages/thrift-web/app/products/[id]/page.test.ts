import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { dynamic } from './page'

describe('product detail route rendering', () => {
  it('renders product details at request time instead of during the build', () => {
    assert.equal(dynamic, 'force-dynamic')
  })
})
