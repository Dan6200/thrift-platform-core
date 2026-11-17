import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it } from 'node:test'

const pageSource = readFileSync(resolve(process.cwd(), 'app/page.tsx'), 'utf8')

describe('home route rendering', () => {
  it('renders product data at request time instead of during the build', () => {
    assert.match(
      pageSource,
      /export const dynamic\s*=\s*['"]force-dynamic['"];/,
    )
  })
})
