import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { loginDestination } from '../lib/login-destination'
test('login returns shoppers to their requested local page', () => {
  assert.equal(loginDestination('/shopping-cart'), '/shopping-cart')
  assert.equal(
    loginDestination('/checkout?step=delivery'),
    '/checkout?step=delivery',
  )
})
test('login rejects external and malformed destinations', () => {
  for (const value of [
    null,
    '',
    '//evil.example',
    '/\\evil.example',
    'https://evil.example',
    '/auth/login',
  ])
    assert.equal(loginDestination(value), '/')
})
